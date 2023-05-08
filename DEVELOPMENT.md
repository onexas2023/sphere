# 前言
此產品是以 TypeScript + React 為主.使用 node 來做為啟動的 Server, 另外透過 `@onexas/coordinate-api-sdk-typescript`等 SDK 來與 Server 做RESTAPI的溝通

運用到的主要技術如下

- TypeScript (language)
- React (ui framework)
- Meterail-UI (ui component)
- Express (frondend server host)
- Webpack (release package)

# 目錄結構介紹

主要package為

- sphere (Sphere 核心)

```
src
└── sphere
    ├── client
    ├── server
```

# 環境
目前驗証過的開發環境為
- Developer
  - Windows 10
  - Node 12.15.0
  - Npm 6.13.4
  - VsCode 1.76.2

- Jenkins Build
  - Ubuntu 18.4
  - Node 12.15.0
  - Npm 6.13.4

# Import 規則
## Source Code Import

 `專案相依因素`
 * 不要使用`'../.*'`這種向上的相對路徑, 此時請使用決對路徑 (e.g `'@onexas/sphere/client/utils/ui'`). 同層(`./ui`)或向下相依的可以使用(`./util/ui`)

 `WebPack時檔案大小因素`
 * 不可使用`'@mui/material'`, `'@mui/lab'`, 此時請指定到單一的元件(e.g `'@mui/material/CardActions'`)
 * 不可使用`'@fortawesome/.*-icons'`, 此時請指定到單一的圖示(e.g `'@fortawesome/free-regular-svg-icons/faListAlt'`),
   故, 規定一律使用`clinet/icons`來集中管理
 * 不可使用`'@onexas/coordinate-api-sdk-typescript/dist/apis'`, 
   此時請指定Api或單一Model物件(e.g `'@onexas/coordinate-api-sdk-typescript/dist/apis/CoordinateProjectApi'`, `'@onexas/coordinate-api-sdk-typescript/dist/models/MetricPrefix'`),
   故, 規定一律使用`coordinate-api.ts`來集中管理


# 命名規則

## FileName
- 主檔名
    
React Component的開頭一律大寫.例如： `Alert.tsx or SwitchRoute.tsx`.其它的所有程式一律小寫.例如: `config.ts or logger-util.ts`
    
- 副檔名

  副檔名一律是以 ts 及 tsx 為主.分別如下.

	- ts  (非react component)
	- tsx (react component)

## Interface
- 採用 Camel-Case 命名規則. 大寫開頭, 例如： `MyInterface`

## Type
- 採用 Camel-Case 命名規則. 大寫開頭, 例如： `type MyType`

## Class
- 採用 Camel-Case 命名規則. 大寫開頭, 例如： `class MyClass`

## Variables
- 採用 Camel-Case 命名規則. 小寫開頭, 例如： `defaultConfig`
- i18n 命名同樣也採用 Camel-Case: ` "displayName": "Display Name"`

# React Component

## 命名及結構 
   以 Alert Component 為例, 目錄名叫 Alert .同時要有 index.ts (負責 export component) 及 Alert.tsx (React Component)

 	- Alert/
 	  - index.ts (export component)
 	  - Alert.tsx (React Component)
 	  - Alert.test.tsx (test component)
 	  - styles.ts (style)	
 	  - 

## componentDidMount
	
render view page 時要 fetch data 時必須寫在 componentDidMount.  不要使用 componentWillMount, 此方法已被 deprecated了.在 react 17.x 就會正式被移除.
 	
## mobx v.s. state

非核心元件, 或非在意完全自主控制的元件, 請盡量使用mobx-react@observer及mobx@observable, 不要使用state, 來降低程式維護的複雜度. 另外, 只需要在值更新時, UI也需更新的欄位上使用@observable, 以提升程式效能.

## when to use mobx.runInAction
* 對於一般物件(非@observer的react元件, 例如MyAccountStore), 當一般同步method會更動@observable欄位時, 該method要加上@action. 
  而該method如果有呼叫其他async method時, 在該呼叫結束若要更動@observable欄位, 則需要runInAction內更動, 才會通知變動.
* (2022/9/14, Dennis) 在今天的測試下, runInAction似乎不再需要了, 但若enforceActions不是設成never的話, 會有過多不合法的的warn出現在console.
  理論上, 好的寫法是仍要遵守上面的規定才是, 目前的codebase仍有使用runInAction, 且在reactor component上並沒遵守上面的規則,
  應該是歷史累績的因素(從mobx 4.15 -> 6.1), 目前將不作非必要的reactor.


## Defining Method Names
- `render`: 如果 method 是為了要 render HTML 的.在命名上前都要加上 render開頭.例如： renderForm
- `on` : 如果是在component有綁定 event 的行為.在命名上都加上 on開頭.例如: onChange
- 其它若不是以上二種.則不限制命名規則.只要符合意義即可.例如: validateForm

 	
```
renderPasswordForm(){
    ... (略) ...
}
onChange = () => {
    ... (略) ...
}
validateProfileForm(){
    ... (略) ...
}
```
 	  
## Using Arrow Function

在 react render view 中有使用到 bind event 行為的一律使用 Arrow Function [stackoverflow](https://stackoverflow.com/questions/50375440/binding-vs-arrow-function-for-react-onclick-event) 

   
```   
onChangeLocale = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.props.i18n.changeLocale(e.target.value);
};

<Select onChange={this.onChangeLocale}>
    <MenuItem value={"en"}>English</MenuItem>

    ... (略) ...

</Select>
                                
```
    
若不是render view中的bind event則採用一般的 function 寫法.i.e. 不需要在非 `onXXX` 使用 Arrow Function
    
```
 validateForm(){
	 
    ... (略) ...
    
};
```

## I18n 

多國語系包放置在 i18n 目錄下.例如: `en.json, zh-TW.json`.語系包內容大致如下

```
{
    "login": "Login",
    "projects": "Projects",
    "profile": {
        "@": "Profle"
        "displayName": "Display Name",
        "updatePassword": "Update Passowrd",
        "oldPassword": "Old Password",
        "newPassword": "New Password",
    }
    ...(略)...
}
```

透過 `i18n.l` 或 `i18n.t.l` 來取出多國語系內容 (其中`i18n.t.l`支援語系變化重新載入)
, 例如`i18n.l("profile")`或`i18n.t.l("profile.oldPassword")`

```
 <TextField
    type="password"
    id="oldPassword"
    className={classes.textField}
    label={i18n.t.l("profile.oldPassword")}
    ... (略) ...
/>
```


## Form 
 
在 Views 中若有使用到 Form 的.請加上 onSubmit.除非有特殊不需要按Enter就可以送出表單的情況.
 	
```
<form className={classes.form} onSubmit={this.onSubmit}>
 	
	...(略) ...
 	
</form>
```	
不使用form的時候, 可使用



# Store

 檔案名稱為 [name]Store.ts.例如: `DemoStore`.
 
 這邊的 Store 是使用 Mobx 來管理狀態追蹤, 細節用法可以參考[Mobx官方文件](https://mobx.js.org/getting-started.html)
 	
	
Store 必須繼承 AbstractStore, 並且要有 `static readonly Name = [name]"Store"`
```
 export class DemoStore extends AbstractStore {
 
 	static readonly Name = "demoStore"
 	
 	... (略)
    @observable
    str: string
 	
	constructor(config: IConfig, cookies: ICookies, storeHolder: StoreHolder) {
      super(DemoStore.NAME, config, cookies, storeHolder)
      makeObservable(this);
	}
    
    ... (略)
 }
```

# Views
 	
即畫面上要呈現的頁面.目前是使用 meterial-ui .詳細請參考[官方網站](https://material-ui.com/).

命名方式及規則`同 React component 規則` 

Views page 相關的說明如下：
 	
## componentDidMount
	
`同 React component 規則` 
	
## Date fetch	
	
views 如果有 fetch data 或是 action 一律使用 async 並傳回promise或void.
	
```
async fetchDomain() {
    return new CoordinateMetainfoApi(buildApiConfig(this.storeHolder.getWorkspaceStore())).listDomain()
        .then(res => {
            let domains: UDomain[] = [];
            res.forEach(domain => domains.push(domain));
            this.domains = domains;
        });
}

```

## Store v.s. member field mbox@observable
- 若非強烈的performance需求要自行控制state, 否則請一律使用Store或@observable.
- 主要使用Store的時機
  - 資訊可多頁Cache
  - 資訊需跨頁共享

- 主要使用member field @observable的時機
  - 資料邏輯獨立沒重用性
  - 獨立簡易控制

## Progress Indicator and Error handle

Views 處理 fetch data 及 catch error handle, 使用Ally來協助Progress及Error的處理
	
```
private ally: Ally;

constructor(props) {
    super(props);
    this.ally = new Ally(this).errorHandler(props.workspaceStore.errorHandler);
}

componentDidMount() {
    this.ally.withProgress(fetchDomain());
}
```
 	
## props and state

需符合 interface 命名規則,  另外Props 要 extends IViewProps. 
因為是採用 Mobx , 所以在 View 需使用 `@observer ` 透過 Store 的 `@observable` 可以同步props傳進來的變數.

 
```
interface SignInViewProps extends ViewProps {
    signInStore: SignInStore
}
	
@observer
class SignIn extends React.PureComponent<SignInViewProps> {
	
    constructor(props: SignInViewProps) {
        super(props);
    }

    ... (略) ...

    render() {
        const {
            workspaceStore,
            signInStore
        } = this.props;

        return (
         ... (略) ...
        );
    }
 }
 
```
	
## Defining Method Names
 	
 `同 React component 規則` 
 	 	  
## Arrow Function

 `同 React component 規則` 
    
## Form 
 
 `同 React component 規則` 

## Input value binding

在Binding Input value 時, 需判斷值是否為undefine或null, 若是, 則轉傳為''值 (避免value及default-value binding在undefined時的誤判)
```
<TextField value={bean.text ? bean.text : ''} .../>
```
若為select形試的Input, 則可用NaV物件來作判斷. (使用NaV在值改變時, 要作回歸判斷)
```
function onChange(evt){
    const v = event.target.value;
    bean.text = notNaV(v) ? v : null;
}

<TextField select value={bean.text ? bean.text : Nav} onChange={onChange} .../>
    <MenuItem value={NaV}>No Selection</MenuItem>
```

# 測試

## React Component Test


PATH: ` create a file to client/components/[component name]/[component name].test.tsx `

針對 client components 下進行測試.測試行為分二部份
- MatchSnapshot
- render test (驗證 render 出來的 dom 的內容是否如預期)

產生出來的 snapshot 會放在 `__shapshop__/src/<package>/p/a/t/h/[name].test.(tsx|ts).snap`

```
describe("Alert Component", () => {
    let component: ReactWrapper;
    const msg: string = "Alert Test Message";

    beforeEach(() => {
        component = mount(<Alert message={msg} />);
    });

    // MatchSnapshot
    it('render Alert Message', () => {
        const component = renderer.create(<Alert message={msg} />);
        const json = component.toJSON();
        expect(json).toMatchSnapshot();
    });

    // render test
    it(`title will render ${msg}`, () => {
        expect(component.find('div').text()).toEqual(msg)
    });
});

```

## Unit / Functional Test

測試單一測試

```
npm run test "<spec 名稱>"
例如: npm run test "Alert"
```

或是指定路徑

```
npm run test <file path>
例如npm run test jest/<package>/client/utils/Object.test.ts -- --coverage=false
```

## Update snapshot component

更新snapshot

```
npm run test "<spec 名稱>" -- -u
例如: npm run test "Alert" -- -u
```

更新snapshot.但不跑覆蓋率

```
npm run test "Alert" -- -u --coverage=false
```

# Follow Issues

## audit-prototype pollution and npm installation WARN
jest在目前的版本引發多installation及audit警告, 目前只能待新版才有解.

audit的錯誤也會因為時間因素, 跟本沒更新的狀況下出現(我猜是因線上資料更新的關系)

## @onexas/react-loadable

官方 react-loadable 尚未解決此問題.所以不能升版至 17.x
所以自行維護(@onexas/react-loadable).並且把  componentWillMount 改為 componentDidMount 去解決這個問題, 
並且定版在 V5.5 的branch 去維護它.

## 在windows 才會發生的 warning
目前在 windows build 時會有以下 warning. 目前暫不理它.之後再看要怎麼解它.

```
npm WARN optional SKIPPING OPTIONAL DEPENDENCY: fsevents@1.2.9 (node_modules\fsevents):
npm WARN notsup SKIPPING OPTIONAL DEPENDENCY: Unsupported platform for fsevents@1.2.9: wanted {"os":"darwin","arch":"any"} (current: {"os":"win32","arch":"x64"})
```
 

## 在windows build時遇到記億體不足的解決方式
```FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory```
在node裏使用```v8.getHeapStatistics()```來查詢total_available_size或heap_size_limit  (預設約1.4Gi),
並且設定環境變數```NODE_OPTIONS=--max_old_space_size=4096```來加大.
(同樣專案, 在linux裏build可能不會out of memory)
```
C:\Users\dennis>node
> v8.getHeapStatistics()
{ total_heap_size: 9682944,
  total_heap_size_executable: 1048576,
  total_physical_size: 9682944,
  total_available_size: 1518481656,
  used_heap_size: 5380072,
  heap_size_limit: 1526909922,
  malloced_memory: 8192,
  peak_malloced_memory: 890096,
  does_zap_garbage: 0 }
> .exit

C:\Users\dennis>set NODE_OPTIONS=--max_old_space_size=4096

C:\Users\dennis>node
> v8.getHeapStatistics()
{ total_heap_size: 9682944,
  total_heap_size_executable: 1048576,
  total_physical_size: 9682944,
  total_available_size: 4393126288,
  used_heap_size: 5398776,
  heap_size_limit: 4401595083,
  malloced_memory: 8192,
  peak_malloced_memory: 890096,
  does_zap_garbage: 0 }
>
```
 
