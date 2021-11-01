using System;
using System.Drawing.Printing;
using System.Runtime.InteropServices;

namespace Printing
{
    public static class PropertiesDialog
    {
        public static int Open(string printerName, string configPath, IntPtr window)
        {
            var printerSettings = new PrinterSettings()
            {
                PrinterName = printerName
            };

            IntPtr printerConfig = Helpers.LoadConfig(configPath);
            if (printerConfig == IntPtr.Zero)
                printerConfig = printerSettings.GetHdevmode(printerSettings.DefaultPageSettings);

            IntPtr defaultPrinterConfig = NativeMethods.GlobalLock(printerConfig);

            var sizeNeeded = NativeMethods.DocumentProperties(window, IntPtr.Zero, printerName, IntPtr.Zero, IntPtr.Zero, 0);

            IntPtr userConfig = Marshal.AllocHGlobal(sizeNeeded);
            var dialogResult = NativeMethods.DocumentProperties(window, IntPtr.Zero, printerName, userConfig,
                defaultPrinterConfig, 14);

            NativeMethods.GlobalUnlock(printerConfig);

            if (dialogResult == 1)
                Helpers.SaveConfig(configPath, userConfig, sizeNeeded);

            Marshal.FreeHGlobal(printerConfig);
            Marshal.FreeHGlobal(userConfig);

            return dialogResult;
        }
    }
}
