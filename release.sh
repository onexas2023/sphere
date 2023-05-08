#!/bin/bash

#set home
BUILD_HOME=$(pwd)

#variable
BRANCH=master

F_PULL=false
F_PREBUILD=false
F_BUILD=false
F_DEPLOY=false
F_HELP=false
F_ERROR=false
F_DOCKER=false
F_DOCKER_PUSH=false
F_OFFICIAL=false
F_DAILY=false


for arg in "$@"
do
case $arg in
	-pull) F_PULL=true;;
	-prebuild) F_PREBUILD=true;;
	-build) F_BUILD=true;;
	-deploy) F_DEPLOY=true;;
	-docker) F_DOCKER=true;;
	-docker_PUSH) F_DOCKER=true;;
	-official) F_OFFICIAL=true;;
	-daily) F_DAILY=true;;
	-all) 
		F_PULL=true
		F_PREBUILD=true
		F_DEPLOY=true
		F_BUILD=true
		F_DOCKER=true
		F_DOCKER_PUSH=true
		;;
	-help)
		F_HELP=true
		;;
	*)
		echo '>>>> Unknow arg : ' $arg
		F_HELP=true
		F_ERROR=true
		;;
esac
done

if $F_HELP;then 
	echo -e 'Usage : '
	echo -e '\t-official \t official release, will contains stage in the version'
	echo -e '\t-daily \t daily release, will contains daily-daystamp in the version'
	echo -e '\t-pull \t pull projects from git (will discard local changes)'
	echo -e '\t-prebuild \t prebuild projects (e.g install 3rd lib)'
	echo -e '\t-build \t build projects'
	echo -e '\t-deploy \t deploy projects to repository'
	echo -e '\t-docker \t build docker image to projects to repository'
	echo -e '\t-docker-push \t push docker image to projects to repository'
	echo -e '\t-all \t pull,prebuild,build,deploy,docker projects'	
fi

if $F_OFFICIAL && $F_DAILY; then
	echo -e "can't set both official and daily"
	F_ERROR=true
fi


if $F_ERROR;then 
	exit 1
fi
if $F_HELP;then 
	exit 0	
fi

echo '========================================================='
#read local brach info
TEMP="branch.local"
if [ -f "$TEMP" ]; then 
	while read line; do
		BRANCH=$line
		echo 'Use local branch : '$BRANCH
		break;
	done < $TEMP
fi


echo '=============== Start to release  ==============='
echo 'Variables : '
echo -e '\tHome directory : ' $BUILD_HOME
echo -e '\tOfficial : ' $F_OFFICIAL
echo -e '\tDaily : ' $F_DAILY
echo -e '\tBranch : ' $BRANCH

echo -e '\tPull : ' $F_PULL
echo -e '\tPreBuild : ' $F_PREBUILD
echo -e '\tBuild : ' $F_BUILD
echo -e '\tDeploy : ' $F_DEPLOY
echo -e '\tDocker : ' $F_DOCKER
echo -e '\tDockerPush : ' $F_DOCKER_PUSH

#set exit shell when error
set -e

#pull git
if $F_PULL; then
	echo '>>>> Pull '
	echo '>>>> Pull latest branch : '$BRANCH
	git reset --hard HEAD
	git fetch origin	
	git checkout $BRANCH
	git reset --hard origin/$BRANCH
fi

#read version after pull
cd $BUILD_HOME
while read line; do
	VER=$line
	break;
done < version
while read line; do
	VER_STG=$line
	break;
done < version-stage
while read line; do
	VER_DEV=$line
	break;
done < version-dev

if [[ -z $VER ]] || [[ -z $VER_DEV ]]; then
	echo -e '>>>> Can not get version info ($VER,$VER_DEV)'
	exit 1
fi

#yyyyMMdd
VER_DATE=$(date +"%Y%m%d")
#HHmmss
VER_TIME=$(date +"%H%M")

if $F_OFFICIAL;then 
	if [[ -z $VER_STG ]];then 
		VER_FINAL=$VER
	else
		VER_FINAL=$VER'-'$VER_STG
	fi
else
	#daily build version , e.g 2.1.0-snapshot-timestamp
	if $F_DAILY;then
		VER_FINAL=$VER'-'$VER_DATE'-SNAPSHOT'
	else
		VER_FINAL=$VER'-'$VER_DATE$VER_TIME'-SNAPSHOT'
	fi
	
fi
echo -e '>>>> Version : ' $VER_DEV ' to ' $VER_FINAL
#prepare dist folder
NAMEVER_FINAL=sphere-$VER_FINAL


DISTDIR=$BUILD_HOME'/../dist/'$NAMEVER_FINAL
LASTDIR=$BUILD_HOME'/../dist/last/sphere'

mkdir -p $DISTDIR
cd "${DISTDIR}"; DISTDIR=`pwd`
mkdir -p $LASTDIR
cd "${LASTDIR}"; LASTDIR=`pwd`

echo -e '>>>> Dist dir : ' $DISTDIR
echo -e '>>>> Last dir : ' $LASTDIR

cd $BUILD_HOME
#prevuild
if $F_PREBUILD; then
	echo '>>>> Prebuild '
	echo '>>>> Install/Re-install lib : '	
    npm ci
fi

#build
if $F_BUILD; then
	echo '>>>> Start to build : '

	#search replace version
	echo '>>>> Replace version : '$VER_DEV' to '$VER_FINAL
	cd $BUILD_HOME
	./replaceVer.sh $BUILD_HOME $VER_DEV $VER_FINAL

    #clean
    echo '>>>> Clean build folder'
    npm run clean

    #build
    echo '>>>> Build'
    npm run build-res
	npm run build	
    npm run bundle-res sphere
    npm run bundle sphere
    npm run test-nocover
	
	cd $BUILD_HOME/build/sphere
	if $F_DAILY; then
		echo '>>>>>> Append sphere snapshot time for npm version T'$VER_TIME
		npm-snapshot 'T'$VER_TIME
	fi

	#copy build
	TEMP=$DISTDIR/build/
	echo '>>>> Copy bundle '$TEMP
	mkdir -p $TEMP
	cp -r $BUILD_HOME/build/* $TEMP

	#copy bundle
	TEMP=$DISTDIR/bundle/
	echo '>>>> Copy bundle '$TEMP
	mkdir -p $TEMP
	cp -r $BUILD_HOME/bundle/* $TEMP

	#copy distribution to last
	echo '>>>> Copy distribution to '$LASTDIR
	cp -r $DISTDIR/. $LASTDIR/.	

	#remove source map, we don't want them in further processing, they are in dist already
	#|| true to avoid rm cause error
	find bundle -name sourcemaps -exec rm -rf {} \; || true 
fi

#deploy
if $F_DEPLOY; then

	echo '>>>> Start to deploy : '

	cd $BUILD_HOME
	./node_modules/.bin/json -I -f ./build/sphere/package.json -e 'this.private=false'

	
	cd $BUILD_HOME/build/sphere	
	npm publish

	cd $BUILD_HOME
	./node_modules/.bin/json -I -f ./build/sphere/package.json -e 'this.private=true'

fi


#docker
if $F_DOCKER; then

    echo '>>>> Start to build docker image : '

	cd $BUILD_HOME
    
    docker build . -t nexus.mshome.net:8082/repository/docker-releases/sphere:latest

	if $F_OFFICIAL;then 
		VER_DOCKER=$VER_FINAL

        docker tag nexus.mshome.net:8082/repository/docker-releases/sphere:latest nexus.mshome.net:8082/repository/docker-releases/sphere:$VER_DOCKER
	fi
fi

if $F_DOCKER_PUSH; then

	#The runtime should has token setting by 
	#docker login -u YOUR_DEPLOY_TOKEN_USERNAME -p YOUR_DEPLOY_TOKEN nexus.mshome.net:8082
	#you also need to add "insecure-registries" : ["nexus.mshome.net:8082"] to /etc/docker/daemon.json to avoid server gave HTTP response to HTTPS client

    echo '>>>> Start to build docker image : '

	cd $BUILD_HOME

	docker push nexus.mshome.net:8082/repository/docker-releases/sphere:latest

	if $F_OFFICIAL;then 
		VER_DOCKER=$VER_FINAL
		
	    docker push nexus.mshome.net:8082/repository/docker-releases/sphere:$VER_DOCKER
	fi
fi



echo '=============== Release finished ==============='

