declare module 'zkteco-js' {
    class ZKTECO {
      constructor(ip: string, port: number, timeout?: number, inport?: number);
      connect(): Promise<void>;
      disconnect(): Promise<void>;
      getSerialNumber(): Promise<string>;
      getFirmware(): Promise<string>;
      getInfo(): Promise<{ data: any }>;
      getAttendances(callback?: (percent: number, total: number) => void): Promise<{ data: any[] }>; // Define 'any[]' or a more specific type for attendance data
      // Add other methods you use...
    }
    export default ZKTECO;
  }