/*
 * @file-created: 2023-09-20
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */

export function read(file: File, callback: (file: File, content: Uint8Array) => void) {
    const reader = new FileReader();
    reader.onload = () => {
        const buffer = reader.result as ArrayBuffer;
        callback(file, new Uint8Array(buffer));
    };
    reader.readAsArrayBuffer(file);
}

export function readAdv(
    file: File,
    handleOnLoad: (file: File, content: Uint8Array, crunkIdx: number) => Promise<void>,
    onEof: (file: File) => void,
    option?: {
        onError?: (file: File, err: Error, crunkIdx: number) => void;
        onAbort?: (file: File, crunkIdx: number) => void;
        crunkSize?: number;
    }
) {
    let crunkIdx = 0;
    let offset = 0;
    const { onError, onAbort, crunkSize = 1024 * 1024 } = option || {};

    const reader = new FileReader();

    reader.onload = () => {
        const buffer = reader.result as ArrayBuffer;
        offset += buffer.byteLength;
        handleOnLoad(file, new Uint8Array(buffer), crunkIdx++).then(() => {
            continueReading();
        });
    };
    if (onError) {
        reader.onerror = () => {
            onError(file, reader.error, crunkIdx);
        };
    }
    if (onAbort) {
        reader.onabort = () => {
            onAbort(file, crunkIdx);
        };
    }

    const continueReading = () => {
        if (offset >= file.size) {
            // the offset same as file size
            onEof(file);
            return;
        }
        var slice = file.slice(offset, offset + crunkSize);
        reader.readAsArrayBuffer(slice);
    };

    continueReading();
}
