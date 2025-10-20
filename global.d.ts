type Messages = typeof import("./i18n/locales/en.json")["default"];
declare interface IntlMessages extends Messages {}

// File System Access API type declarations
declare global {
  interface FileSystemHandle {
    kind: "file" | "directory";
    name: string;
  }

  interface FileSystemFileHandle extends FileSystemHandle {
    kind: "file";
    getFile(): Promise<File>;
    createWritable(options?: FileSystemCreateWritableOptions): Promise<FileSystemWritableFileStream>;
  }

  interface FileSystemDirectoryHandle extends FileSystemHandle {
    kind: "directory";
    getFileHandle(name: string, options?: FileSystemGetFileOptions): Promise<FileSystemFileHandle>;
    getDirectoryHandle(name: string, options?: FileSystemGetDirectoryOptions): Promise<FileSystemDirectoryHandle>;
    removeEntry(name: string, options?: FileSystemRemoveOptions): Promise<void>;
    queryPermission(descriptor?: FileSystemPermissionDescriptor): Promise<PermissionState>;
    requestPermission(descriptor?: FileSystemPermissionDescriptor): Promise<PermissionState>;
    entries(): AsyncIterable<[string, FileSystemHandle]>;
  }

  interface FileSystemGetFileOptions {
    create?: boolean;
  }

  interface FileSystemGetDirectoryOptions {
    create?: boolean;
  }

  interface FileSystemRemoveOptions {
    recursive?: boolean;
  }

  interface FileSystemCreateWritableOptions {
    keepExistingData?: boolean;
  }

  interface FileSystemPermissionDescriptor {
    mode?: "read" | "readwrite";
  }

  interface FileSystemWritableFileStream extends WritableStream {
    write(data: BufferSource | Blob | string): Promise<void>;
    seek(position: number): Promise<void>;
    truncate(size: number): Promise<void>;
  }

  interface FileSystemDirectoryPickerOptions {
    id?: string;
    mode?: "read" | "readwrite";
    startIn?: FileSystemHandle;
  }

  interface Window {
    showDirectoryPicker(options?: FileSystemDirectoryPickerOptions): Promise<FileSystemDirectoryHandle>;
    showOpenFilePicker(options?: any): Promise<FileSystemFileHandle[]>;
    showSaveFilePicker(options?: any): Promise<FileSystemFileHandle>;
  }
}
