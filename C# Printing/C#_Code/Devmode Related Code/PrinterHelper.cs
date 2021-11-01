using System;
using System.Text;
using System.Runtime.InteropServices;
using System.Security;
using System.ComponentModel;

namespace Printing
{
    /// <summary>
    /// Origin: http://blog.csdn.net/csui2008/article/details/5718461
    /// Modified and a little tested by Huan-Lin Tsai. May-29-2013.
    /// </summary>
    public static class PrinterHelper
    {
        #region "Private Variables"

        private static int lastError;
        private static int nRet; //long 
        private static int intError;
        private static System.Int32 nJunk;

        #endregion

        #region "API Define"

        [DllImport("winspool.drv", CharSet = CharSet.Auto, SetLastError = true)]
        public static extern bool SetDefaultPrinter(string printerName);


        [DllImport("winspool.Drv", EntryPoint = "ClosePrinter", SetLastError = true,
            ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
        private static extern bool ClosePrinter(IntPtr hPrinter);

        // [DllImport("winspool.Drv", EntryPoint = "DocumentPropertiesA", SetLastError = true,
        //     ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
        // private static extern int DocumentProperties(IntPtr hwnd, IntPtr hPrinter,
        //     [MarshalAs(UnmanagedType.LPStr)] string pDeviceNameg,
        //     IntPtr pDevModeOutput, ref IntPtr pDevModeInput, int fMode);

        [DllImport("winspool.Drv", EntryPoint = "DocumentPropertiesA", SetLastError = true,
            ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
        internal static extern int DocumentProperties(
            IntPtr hwnd,
            IntPtr hPrinter,
            [MarshalAs(UnmanagedType.LPStr)] string pDeviceName,
            IntPtr pDevModeOutput,
            IntPtr pDevModeInput,
            int fMode
        );

        [DllImport("winspool.Drv", EntryPoint = "GetPrinterA", SetLastError = true,
            CharSet = CharSet.Ansi, ExactSpelling = true,
            CallingConvention = CallingConvention.StdCall)]
        private static extern bool GetPrinter(IntPtr hPrinter, Int32 dwLevel,
            IntPtr pPrinter, Int32 dwBuf, out Int32 dwNeeded);

        [DllImport("winspool.Drv", EntryPoint = "OpenPrinterA",
            SetLastError = true, CharSet = CharSet.Ansi,
            ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
        private static extern bool
            OpenPrinter([MarshalAs(UnmanagedType.LPStr)] string szPrinter,
                out IntPtr hPrinter, ref PRINTER_DEFAULTS pd);

        [DllImport("winspool.drv", CharSet = CharSet.Ansi, SetLastError = true)]
        private static extern bool SetPrinter(IntPtr hPrinter, int Level, IntPtr
            pPrinter, int Command);

        [DllImport("winspool.drv", CharSet = CharSet.Auto, SetLastError = true)]
        internal static extern bool GetDefaultPrinter(StringBuilder pszBuffer, ref int size);

        [DllImport("GDI32.dll", EntryPoint = "CreateDC", SetLastError = true,
             CharSet = CharSet.Unicode, ExactSpelling = false,
             CallingConvention = CallingConvention.StdCall),
         SuppressUnmanagedCodeSecurityAttribute()]
        internal static extern IntPtr CreateDC([MarshalAs(UnmanagedType.LPTStr)] string pDrive,
            [MarshalAs(UnmanagedType.LPTStr)] string pName,
            [MarshalAs(UnmanagedType.LPTStr)] string pOutput,
            ref DEVMODE pDevMode);

        [DllImport("GDI32.dll", EntryPoint = "ResetDC", SetLastError = true,
             CharSet = CharSet.Unicode, ExactSpelling = false,
             CallingConvention = CallingConvention.StdCall),
         SuppressUnmanagedCodeSecurityAttribute()]
        internal static extern IntPtr ResetDC(
            IntPtr hDC,
            ref DEVMODE
                pDevMode);

        [DllImport("GDI32.dll", EntryPoint = "DeleteDC", SetLastError = true,
             CharSet = CharSet.Unicode, ExactSpelling = false,
             CallingConvention = CallingConvention.StdCall),
         SuppressUnmanagedCodeSecurityAttribute()]
        internal static extern bool DeleteDC(IntPtr hDC);

        [DllImport("winspool.drv", EntryPoint = "DeviceCapabilitiesA", SetLastError = true)]
        internal static extern Int32 DeviceCapabilities(
            [MarshalAs(UnmanagedType.LPStr)] String device,
            [MarshalAs(UnmanagedType.LPStr)] String port,
            Int16 capability,
            IntPtr outputBuffer,
            IntPtr deviceMode);

        [DllImport("winspool.drv", SetLastError = true)]
        internal static extern bool EnumPrintersW(Int32 flags,
            [MarshalAs(UnmanagedType.LPTStr)] string printerName,
            Int32 level, IntPtr buffer, Int32 bufferSize, out Int32
                requiredBufferSize, out Int32 numPrintersReturned);

        [DllImport("kernel32.dll", EntryPoint = "GetLastError", SetLastError = false,
             ExactSpelling = true, CallingConvention = CallingConvention.StdCall),
         SuppressUnmanagedCodeSecurityAttribute()]
        internal static extern Int32 GetLastError();

        [DllImport("user32.dll", SetLastError = true, CharSet = CharSet.Auto)]
        public static extern IntPtr SendMessageTimeout(
            IntPtr windowHandle,
            uint Msg,
            IntPtr wParam,
            IntPtr lParam,
            SendMessageTimeoutFlags flags,
            uint timeout,
            out IntPtr result
        );

        #endregion

        #region "Data structure"

        /// <summary>
        /// Paper access rights and other information
        /// </summary>
        [StructLayout(LayoutKind.Sequential)]
        public struct PRINTER_DEFAULTS
        {
            public int pDatatype;
            public int pDevMode;
            public int DesiredAccess; // Access to the printer
        }


        // Paper Orientation
        public enum PageOrientation
        {
            DMORIENT_PORTRAIT = 1, // Vertical
            DMORIENT_LANDSCAPE = 2, // Horizontal
        }

        /// <summary>
        /// Paper type
        /// </summary>
        public enum PaperSize
        {
            DMPAPER_LETTER = 1, // Letter 8 1/2 x 11 in
            DMPAPER_LETTERSMALL = 2, // Letter Small 8 1/2 x 11 in
            DMPAPER_TABLOID = 3, // Tabloid 11 x 17 in
            DMPAPER_LEDGER = 4, // Ledger 17 x 11 in
            DMPAPER_LEGAL = 5, // Legal 8 1/2 x 14 in
            DMPAPER_STATEMENT = 6, // Statement 5 1/2 x 8 1/2 in
            DMPAPER_EXECUTIVE = 7, // Executive 7 1/4 x 10 1/2 in
            DMPAPER_A3 = 8, // A3 297 x 420 mm
            DMPAPER_A4 = 9, // A4 210 x 297 mm
            DMPAPER_A4SMALL = 10, // A4 Small 210 x 297 mm
            DMPAPER_A5 = 11, // A5 148 x 210 mm
            DMPAPER_B4 = 12, // B4 250 x 354
            DMPAPER_B5 = 13, // B5 182 x 257 mm
            DMPAPER_FOLIO = 14, // Folio 8 1/2 x 13 in
            DMPAPER_QUARTO = 15, // Quarto 215 x 275 mm
            DMPAPER_10X14 = 16, // 10x14 in
            DMPAPER_11X17 = 17, // 11x17 in
            DMPAPER_NOTE = 18, // Note 8 1/2 x 11 in
            DMPAPER_ENV_9 = 19, // Envelope #9 3 7/8 x 8 7/8
            DMPAPER_ENV_10 = 20, // Envelope #10 4 1/8 x 9 1/2
            DMPAPER_ENV_11 = 21, // Envelope #11 4 1/2 x 10 3/8
            DMPAPER_ENV_12 = 22, // Envelope #12 4 /276 x 11
            DMPAPER_ENV_14 = 23, // Envelope #14 5 x 11 1/2
            DMPAPER_CSHEET = 24, // C size sheet
            DMPAPER_DSHEET = 25, // D size sheet
            DMPAPER_ESHEET = 26, // E size sheet
            DMPAPER_ENV_DL = 27, // Envelope DL 110 x 220mm
            DMPAPER_ENV_C5 = 28, // Envelope C5 162 x 229 mm
            DMPAPER_ENV_C3 = 29, // Envelope C3 324 x 458 mm
            DMPAPER_ENV_C4 = 30, // Envelope C4 229 x 324 mm
            DMPAPER_ENV_C6 = 31, // Envelope C6 114 x 162 mm
            DMPAPER_ENV_C65 = 32, // Envelope C65 114 x 229 mm
            DMPAPER_ENV_B4 = 33, // Envelope B4 250 x 353 mm
            DMPAPER_ENV_B5 = 34, // Envelope B5 176 x 250 mm
            DMPAPER_ENV_B6 = 35, // Envelope B6 176 x 125 mm
            DMPAPER_ENV_ITALY = 36, // Envelope 110 x 230 mm
            DMPAPER_ENV_MONARCH = 37, // Envelope Monarch 3.875 x 7.5 in
            DMPAPER_ENV_PERSONAL = 38, // 6 3/4 Envelope 3 5/8 x 6 1/2 in
            DMPAPER_FANFOLD_US = 39, // US Std Fanfold 14 7/8 x 11 in
            DMPAPER_FANFOLD_STD_GERMAN = 40, // German Std Fanfold 8 1/2 x 12 in
            DMPAPER_FANFOLD_LGL_GERMAN = 41, // German Legal Fanfold 8 1/2 x 13 in
            DMPAPER_USER = 256, // user defined
            DMPAPER_FIRST = DMPAPER_LETTER,
            DMPAPER_LAST = DMPAPER_USER,
        }


        /// <summary>
        /// Paper source
        /// </summary>
        public enum PaperSource
        {
            DMBIN_UPPER = 1,
            DMBIN_LOWER = 2,
            DMBIN_MIDDLE = 3,
            DMBIN_MANUAL = 4,
            DMBIN_ENVELOPE = 5,
            DMBIN_ENVMANUAL = 6,
            DMBIN_AUTO = 7,
            DMBIN_TRACTOR = 8,
            DMBIN_SMALLFMT = 9,
            DMBIN_LARGEFMT = 10,
            DMBIN_LARGECAPACITY = 11,
            DMBIN_CASSETTE = 14,
            DMBIN_FORMSOURCE = 15,
            DMRES_DRAFT = -1,
            DMRES_LOW = -2,
            DMRES_MEDIUM = -3,
            DMRES_HIGH = -4
        }


        /// <summary>
        /// Whether to print on both sides
        /// </summary>
        public enum PageDuplex
        {
            DMDUP_HORIZONTAL = 3,
            DMDUP_SIMPLEX = 1,
            DMDUP_VERTICAL = 2
        }


        /// <summary>
        /// Printing parameters that need to be changed
        /// </summary>
        public struct PrinterSettingsInfo
        {
            public PageOrientation Orientation; //  Print direction
            public PaperSize Size; // Print paper type (indicated by numbers, 256 is user-defined paper)
            public PaperSource source; // Paper source
            public PageDuplex Duplex; // Whether to print on both sides and other information
            public int pLength; // Paper height
            public int pWidth; // Paper width
            public int pmFields; // The information to be changed is the sum of the "|" operation
            public string pFormName; // Paper name
        }

        // PRINTER_INFO_2 - The printer information structure contains 1..9 levels, please refer to API for details
        [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Auto)]
        private struct PRINTER_INFO_2
        {
            [MarshalAs(UnmanagedType.LPStr)] public string pServerName;
            [MarshalAs(UnmanagedType.LPStr)] public string pPrinterName;
            [MarshalAs(UnmanagedType.LPStr)] public string pShareName;
            [MarshalAs(UnmanagedType.LPStr)] public string pPortName;
            [MarshalAs(UnmanagedType.LPStr)] public string pDriverName;
            [MarshalAs(UnmanagedType.LPStr)] public string pComment;
            [MarshalAs(UnmanagedType.LPStr)] public string pLocation;
            public IntPtr pDevMode;
            [MarshalAs(UnmanagedType.LPStr)] public string pSepFile;
            [MarshalAs(UnmanagedType.LPStr)] public string pPrintProcessor;
            [MarshalAs(UnmanagedType.LPStr)] public string pDatatype;
            [MarshalAs(UnmanagedType.LPStr)] public string pParameters;
            public IntPtr pSecurityDescriptor;
            public Int32 Attributes;
            public Int32 Priority;
            public Int32 DefaultPriority;
            public Int32 StartTime;
            public Int32 UntilTime;
            public Int32 Status;
            public Int32 cJobs;
            public Int32 AveragePPM;
        }


        // PRINTER_INFO_5 - The printer information structure contains 1..9 levels, please refer to API for details
        [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Auto)]
        private struct PRINTER_INFO_5
        {
            [MarshalAs(UnmanagedType.LPTStr)] public String PrinterName;
            [MarshalAs(UnmanagedType.LPTStr)] public String PortName;
            [MarshalAs(UnmanagedType.U4)] public Int32 Attributes;
            [MarshalAs(UnmanagedType.U4)] public Int32 DeviceNotSelectedTimeout;
            [MarshalAs(UnmanagedType.U4)] public Int32 TransmissionRetryTimeout;
        }


        // PRINTER_INFO_9 - The printer information structure contains 1..9 levels, please refer to API for details
        [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Auto)]
        internal struct PRINTER_INFO_9
        {
            public IntPtr pDevMode;
        }

        /// <summary>
        /// The DEVMODE data structure contains information about the initialization and environment of a printer or a display device
        /// For details, please refer to API
        /// </summary>
        private const short CCDEVICENAME = 32;

        private const short CCFORMNAME = 32;

        [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi)]
        public struct DEVMODE
        {
            [MarshalAs(UnmanagedType.ByValTStr, SizeConst = CCDEVICENAME)]
            public string dmDeviceName;

            public short dmSpecVersion;
            public short dmDriverVersion;
            public short dmSize;
            public short dmDriverExtra;
            public int dmFields;
            public short dmOrientation;
            public short dmPaperSize;
            public short dmPaperLength;
            public short dmPaperWidth;
            public short dmScale;
            public short dmCopies;
            public short dmDefaultSource;
            public short dmPrintQuality;
            public short dmColor;
            public short dmDuplex;
            public short dmYResolution;
            public short dmTTOption;
            public short dmCollate;

            [MarshalAs(UnmanagedType.ByValTStr, SizeConst = CCFORMNAME)]
            public string dmFormName;

            public short dmUnusedPadding;
            public short dmBitsPerPel;
            public int dmPelsWidth;
            public int dmPelsHeight;
            public int dmDisplayFlags;
            public int dmDisplayFrequency;
        }

        // SendMessageTimeout Flags
        [Flags]
        public enum SendMessageTimeoutFlags : uint
        {
            SMTO_NORMAL = 0x0000,
            SMTO_BLOCK = 0x0001,
            SMTO_ABORTIFHUNG = 0x0002,
            SMTO_NOTIMEOUTIFNOTHUNG = 0x0008
        }

        #endregion

        #region "const Variables"

        //DEVMODE.dmFields
        const int DM_FORMNAME = 0x10000; // This constant must be set in dmFields when changing the paper name
        const int DM_PAPERSIZE = 0x0002; // This constant needs to be set in dmFields when changing the paper type

        const int
            DM_PAPERLENGTH = 0x0004; // This constant needs to be set in dmFields when changing the paper hight/length

        const int DM_PAPERWIDTH = 0x0008; // This constant needs to be set in dmFields when changing the paper width

        const int
            DM_DUPLEX = 0x1000; // You need to set this constant in dmFields when changing whether the paper is printed on both sides

        const int
            DM_ORIENTATION = 0x0001; // You need to set this constant in dmFields when changing the paper direction

        // Used to change the parameters of DocumentProperties, please refer to API for details
        const int DM_IN_BUFFER = 8;
        const int DM_OUT_BUFFER = 2;

        // Used to set access rights to the printer
        const int PRINTER_ACCESS_ADMINISTER = 0x4;
        const int PRINTER_ACCESS_USE = 0x8;
        const int STANDARD_RIGHTS_REQUIRED = 0xF0000;
        const int PRINTER_ALL_ACCESS = (STANDARD_RIGHTS_REQUIRED | PRINTER_ACCESS_ADMINISTER | PRINTER_ACCESS_USE);

        // Get all the paper specified for printing
        const int PRINTER_ENUM_LOCAL = 2;
        const int PRINTER_ENUM_CONNECTIONS = 4;
        const int DC_PAPERNAMES = 16;
        const int DC_PAPERS = 2;
        const int DC_PAPERSIZE = 3;

        //sendMessageTimeOut
        const int WM_SETTINGCHANGE = 0x001A;
        const int HWND_BROADCAST = 0xffff;

        #endregion

        #region "printer method"

        public static bool OpenPrinterEx(string szPrinter, out IntPtr hPrinter, ref PRINTER_DEFAULTS pd)
        {
            bool bRet = OpenPrinter(szPrinter, out hPrinter, ref pd);
            return bRet;
        }

        /// <summary>
        /// Get the DEVMODE structure that represents the settings information of the specified printer.
        /// </summary>
        /// <param name="PrinterName">Printer Name</param>
        /// <returns>DEVMODE Structure</returns>
        public static IntPtr GetPrinterDevMode(string PrinterName)
        {
            if (string.IsNullOrEmpty(PrinterName))
            {
                PrinterName = GetDefaultPrinterName();
            }

            PRINTER_DEFAULTS pd = new PRINTER_DEFAULTS();
            pd.pDatatype = 0;
            pd.pDevMode = 0;
            pd.DesiredAccess = PRINTER_ALL_ACCESS;
            // Michael: some printers (e.g. network printer) do not allow PRINTER_ALL_ACCESS and will cause Access Is Denied error.
            // When this happen, try PRINTER_ACCESS_USE.

            IntPtr hPrinter = new IntPtr();
            if (!OpenPrinterEx(PrinterName, out hPrinter, ref pd))
            {
                lastError = Marshal.GetLastWin32Error();
                throw new Win32Exception(Marshal.GetLastWin32Error());
            }

            //get the size of the devmode structure
            int sizeOfDevMode = DocumentProperties(IntPtr.Zero, hPrinter, PrinterName, IntPtr.Zero, IntPtr.Zero, 0);

            IntPtr ptrDM = NativeMethods.GlobalAlloc(0x42, new UIntPtr((uint) sizeOfDevMode));
            IntPtr lockedPtrDM = NativeMethods.GlobalLock(ptrDM);
            int i;
            i = DocumentProperties(IntPtr.Zero, hPrinter, PrinterName, lockedPtrDM, IntPtr.Zero, DM_OUT_BUFFER);
            if ((i < 0) || (ptrDM == IntPtr.Zero))
            {
                //Cannot get the DEVMODE structure.
                throw new System.Exception("Cannot get DEVMODE data");
            }

            NativeMethods.GlobalUnlock(ptrDM);

            ClosePrinter(hPrinter);

            return ptrDM;
        }


        /// <summary>
        /// Determine whether the specific paper of the current default printer is equal to the incoming size
        /// </summary>
        /// <param name="FormName">Paper name</param>
        /// <param name="width">Width. Unit: 1/10 of a millimeter.</param>
        /// <param name="length">Height. Unit: 1/10 of a millimeter.</param>
        /// <returns>If the paper size in the DEVMODE structure of the default printer is the same as the specified width and height, return true, otherwise return false.</returns>
        public static bool PaperSizeExists(string FormName, int width, int length)
        {
            IntPtr ptrDevMode = GetPrinterDevMode(null);
            IntPtr globalLockedDevModePtr = NativeMethods.GlobalLock(ptrDevMode);
            DEVMODE dm = (DEVMODE) Marshal.PtrToStructure(globalLockedDevModePtr, typeof(DEVMODE));
            bool ret = FormName == dm.dmFormName && width == dm.dmPaperWidth && length == dm.dmPaperLength;
            NativeMethods.GlobalUnlock(ptrDevMode);
            Marshal.FreeHGlobal(ptrDevMode);
            return ret;
        }


        public static void SetCustomPaper(string printerName, PrinterSettingsInfo prnSettings)
        {
            // check printer name
            if (String.IsNullOrEmpty(printerName))
            {
                printerName = GetDefaultPrinterName();
            }

            // printer pointer
            IntPtr hPrinter = new IntPtr();

            // printer default settings
            PRINTER_DEFAULTS prnDefaults = new PRINTER_DEFAULTS();
            prnDefaults.pDatatype = 0;
            prnDefaults.pDevMode = 0;
            prnDefaults.DesiredAccess = PRINTER_ALL_ACCESS;

            // exit if we can't open the printer
            if (!OpenPrinterEx(printerName, out hPrinter, ref prnDefaults))
            {
                return;
            }

            IntPtr ptrPrinterInfo = IntPtr.Zero;
            try
            {
                // Get the size of the DEVMODE structure
                int iDevModeSize = DocumentProperties(IntPtr.Zero, hPrinter, printerName, IntPtr.Zero, IntPtr.Zero, 0);
                if (iDevModeSize < 0)
                    throw new ApplicationException("Cannot get the size of the DEVMODE structure.");

                // Allocate a memory space buffer pointing to the DEVMODE structure
                IntPtr hDevMode = Marshal.AllocHGlobal(iDevModeSize + 100);

                // Get a pointer to the DEVMODE structure
                nRet = DocumentProperties(IntPtr.Zero, hPrinter, printerName, hDevMode, IntPtr.Zero, DM_OUT_BUFFER);
                if (nRet < 0)
                    throw new ApplicationException("Cannot get the size of the DEVMODE structure.");
                // Assign value to dm
                DEVMODE dm = (DEVMODE) Marshal.PtrToStructure(hDevMode, typeof(DEVMODE));

                if ((int) prnSettings.Duplex < 0 || (int) prnSettings.Duplex > 3)
                {
                    throw new ArgumentOutOfRangeException("nDuplexSetting", "nDuplexSetting is incorrect.");
                }
                else
                {
                    // Change printer settings
                    if ((int) prnSettings.Size != 0) // Whether to change the paper type
                    {
                        dm.dmPaperSize = (short) prnSettings.Size;
                        dm.dmFields |= DM_PAPERSIZE;
                    }

                    if (prnSettings.pWidth != 0) // Whether to change the paper width
                    {
                        dm.dmPaperWidth = (short) prnSettings.pWidth;
                        dm.dmFields |= DM_PAPERWIDTH;
                    }

                    if (prnSettings.pLength != 0) // Whether to change the paper height/length
                    {
                        dm.dmPaperLength = (short) prnSettings.pLength;
                        dm.dmFields |= DM_PAPERLENGTH;
                    }

                    if (!String.IsNullOrEmpty(prnSettings.pFormName)) // Whether to change the paper name
                    {
                        dm.dmFormName = prnSettings.pFormName;
                        dm.dmFields |= DM_FORMNAME;
                    }

                    if ((int) prnSettings.Orientation != 0) // Whether to change the paper orientation/direction
                    {
                        dm.dmOrientation = (short) prnSettings.Orientation;
                        dm.dmFields |= DM_ORIENTATION;
                    }

                    Marshal.StructureToPtr(dm, hDevMode, true);

                    nRet = DocumentProperties(IntPtr.Zero, hPrinter, printerName, hDevMode, hDevMode,
                        DM_IN_BUFFER | DM_OUT_BUFFER);
                    if (nRet < 0)
                    {
                        throw new ApplicationException("Unable to set the PrintSetting for this printer");
                    }

                    dm = (DEVMODE) Marshal.PtrToStructure(hDevMode, typeof(DEVMODE));

                    IntPtr dc = CreateDC(null, printerName, null, ref dm);
                    DeleteDC(dc);
                }
            }
            finally
            {
                ClosePrinter(hPrinter);
                //hPrinter = IntPtr.Zero;

                // free memory
                if (ptrPrinterInfo != IntPtr.Zero)
                    Marshal.FreeHGlobal(ptrPrinterInfo);
                //if (hPrinter != IntPtr.Zero)
                //    Marshal.FreeHGlobal(hPrinter);
            }
        }

        /// <summary>
        /// Change printer settings through accessing the printer's devmode by its printerName
        /// </summary>
        /// <param name="printerName">The name of the printer, if it is empty, it will automatically get the name of the default printer</param>
        /// <param name="prnSettings">Printer Settings object reference</param>
        /// <returns>Whether the change is successful or not</returns>
        public static IntPtr ModifyPrinterSettings(string printerName, PrinterSettingsInfo prnSettings, IntPtr hDevMode)
        {
            // check printer name
            if (String.IsNullOrEmpty(printerName))
            {
                printerName = GetDefaultPrinterName();
            }

            // check duplex settings
            if ((int) prnSettings.Duplex < 0 || (int) prnSettings.Duplex > 3)
            {
                throw new ArgumentOutOfRangeException("nDuplexSetting", "nDuplexSetting is incorrect.");
            }


            //Get default preinter devmode if not supplied
            if (hDevMode == IntPtr.Zero)
            {
                hDevMode = GetPrinterDevMode(printerName);
            }

            //Open the printer to apply the settings
            PRINTER_INFO_9 printerInfo;
            printerInfo.pDevMode = IntPtr.Zero;

            // printer pointer
            IntPtr hPrinter = new IntPtr();

            // printer default settings
            PRINTER_DEFAULTS prnDefaults = new PRINTER_DEFAULTS();
            prnDefaults.pDatatype = 0;
            prnDefaults.pDevMode = 0;
            prnDefaults.DesiredAccess = PRINTER_ALL_ACCESS;

            // exit if we can't open the printer
            if (!OpenPrinterEx(printerName, out hPrinter, ref prnDefaults))
            {
                return IntPtr.Zero;
            }

            try
            {
                // Assign value to dm
                IntPtr lockedHDevMode = NativeMethods.GlobalLock(hDevMode);
                DEVMODE dm = (DEVMODE) Marshal.PtrToStructure(lockedHDevMode, typeof(DEVMODE));

                // Change printer settings
                if ((int) prnSettings.Size != 0) // Whether to change the paper type
                {
                    dm.dmPaperSize = (short) prnSettings.Size;
                    dm.dmFields |= DM_PAPERSIZE;
                }

                if (prnSettings.pWidth != 0) // Whether to change the paper width
                {
                    dm.dmPaperWidth = (short) prnSettings.pWidth;
                    dm.dmFields |= DM_PAPERWIDTH;
                }

                if (prnSettings.pLength != 0) // Whether to change the paper height/length
                {
                    dm.dmPaperLength = (short) prnSettings.pLength;
                    dm.dmFields |= DM_PAPERLENGTH;
                }

                if (!String.IsNullOrEmpty(prnSettings.pFormName)) // Whether to change the paper name
                {
                    dm.dmFormName = prnSettings.pFormName;
                    dm.dmFields |= DM_FORMNAME;
                }

                if ((int) prnSettings.Orientation != 0) // Whether to change the paper orientation/direction
                {
                    dm.dmOrientation = (short) prnSettings.Orientation;
                    dm.dmFields |= DM_ORIENTATION;
                }

                Marshal.StructureToPtr(dm, lockedHDevMode, true);

                nRet = DocumentProperties(IntPtr.Zero, hPrinter, printerName, lockedHDevMode, lockedHDevMode,
                    DM_IN_BUFFER | DM_OUT_BUFFER);
                if (nRet < 0)
                {
                    throw new ApplicationException("Unable to set the PrintSetting for this printer");
                }

                //May have to compare value for some printer here and re apply with orientation
                dm = (DEVMODE) Marshal.PtrToStructure(lockedHDevMode, typeof(DEVMODE));


                NativeMethods.GlobalUnlock(hDevMode);

                return hDevMode;

                // return Helpers.SetUnmanagedMemory(Helpers.GetUnmanagedMemory(hDevMode, iDevModeSize));
            }
            finally
            {
                if (hPrinter != IntPtr.Zero)
                    ClosePrinter(hPrinter);
            }
        }


        /// <summary>
        /// Change another version of the printer settings. During the test, the application terminated abnormally without any error message. Please use ModifyPrinterSettings
        /// </summary>
        /// <param name="printerName">The name of the printer. Passing in null or an empty string means to use the default printer.</param>
        /// <param name="PS">Printer Settings</param>
        /// <returns>Whether the change is successful or not</returns>
        public static bool ModifyPrinterSettings_V2(string printerName, ref PrinterSettingsInfo PS)
        {
            PRINTER_DEFAULTS pd = new PRINTER_DEFAULTS();
            pd.pDatatype = 0;
            pd.pDevMode = 0;
            pd.DesiredAccess = PRINTER_ALL_ACCESS;
            if (String.IsNullOrEmpty(printerName))
            {
                printerName = GetDefaultPrinterName();
            }

            IntPtr hPrinter = new System.IntPtr();

            if (!OpenPrinterEx(printerName, out hPrinter, ref pd))
            {
                lastError = Marshal.GetLastWin32Error();
                throw new Win32Exception(Marshal.GetLastWin32Error());
            }

            // Call GetPrinter to get the bytes of PRINTER_INFO_2 in the memory space
            int nBytesNeeded = 0;
            GetPrinter(hPrinter, 2, IntPtr.Zero, 0, out nBytesNeeded);
            if (nBytesNeeded <= 0)
            {
                ClosePrinter(hPrinter);
                return false;
            }

            // Allocate enough memory space for PRINTER_INFO_2
            IntPtr ptrPrinterInfo = Marshal.AllocHGlobal(nBytesNeeded);
            if (ptrPrinterInfo == IntPtr.Zero)
            {
                ClosePrinter(hPrinter);
                return false;
            }

            // Call GetPrinter to fill in the current settings of the office, which is the information you want to change (in ptrPrinterInfo)
            if (!GetPrinter(hPrinter, 2, ptrPrinterInfo, nBytesNeeded, out nBytesNeeded))
            {
                Marshal.FreeHGlobal(ptrPrinterInfo);
                ClosePrinter(hPrinter);
                return false;
            }

            // Convert the indicator pointing to PRINTER_INFO_2 in the memory block into a PRINTER_INFO_2 structure
            // If GetPrinter does not get the DEVMODE structure, it will try to get the DEVMODE structure through DocumentProperties
            PRINTER_INFO_2 pinfo = new PRINTER_INFO_2();
            pinfo = (PRINTER_INFO_2) Marshal.PtrToStructure(ptrPrinterInfo, typeof(PRINTER_INFO_2));
            IntPtr Temp = new IntPtr();
            if (pinfo.pDevMode == IntPtr.Zero)
            {
                // If GetPrinter didn't fill in the DEVMODE, try to get it by calling
                // DocumentProperties...
                IntPtr ptrZero = IntPtr.Zero;
                //get the size of the devmode structure
                nBytesNeeded = DocumentProperties(IntPtr.Zero, hPrinter, printerName, IntPtr.Zero, IntPtr.Zero, 0);
                if (nBytesNeeded <= 0)
                {
                    Marshal.FreeHGlobal(ptrPrinterInfo);
                    ClosePrinter(hPrinter);
                    return false;
                }

                IntPtr ptrDM = Marshal.AllocCoTaskMem(nBytesNeeded);
                int i;
                i = DocumentProperties(IntPtr.Zero, hPrinter, printerName, ptrDM, ptrZero, DM_OUT_BUFFER);
                if ((i < 0) || (ptrDM == IntPtr.Zero))
                {
                    //Cannot get the DEVMODE structure.
                    Marshal.FreeHGlobal(ptrDM);
                    ClosePrinter(ptrPrinterInfo);
                    return false;
                }

                pinfo.pDevMode = ptrDM;
            }

            DEVMODE dm = (DEVMODE) Marshal.PtrToStructure(pinfo.pDevMode, typeof(DEVMODE));

            // Modify printer settings        
            if ((((int) PS.Duplex < 0) || ((int) PS.Duplex > 3)))
            {
                throw new ArgumentOutOfRangeException("nDuplexSetting", "nDuplexSetting is incorrect.");
            }
            else
            {
                if (String.IsNullOrEmpty(printerName))
                {
                    printerName = GetDefaultPrinterName();
                }

                if ((int) PS.Size != 0) // Whether to change the paper type
                {
                    dm.dmPaperSize = (short) PS.Size;
                    dm.dmFields |= DM_PAPERSIZE;
                }

                if (PS.pWidth != 0) // Whether to change the paper width
                {
                    dm.dmPaperWidth = (short) PS.pWidth;
                    dm.dmFields |= DM_PAPERWIDTH;
                }

                if (PS.pLength != 0) // Whether to change the paper height/length
                {
                    dm.dmPaperLength = (short) PS.pLength;
                    dm.dmFields |= DM_PAPERLENGTH;
                }

                if (!String.IsNullOrEmpty(PS.pFormName)) // Whether to change the paper name
                {
                    dm.dmFormName = PS.pFormName;
                    dm.dmFields |= DM_FORMNAME;
                }

                if ((int) PS.Orientation != 0) // Whether to change the paper orientation/direction
                {
                    dm.dmOrientation = (short) PS.Orientation;
                    dm.dmFields |= DM_ORIENTATION;
                }

                Marshal.StructureToPtr(dm, pinfo.pDevMode, true);
                Marshal.StructureToPtr(pinfo, ptrPrinterInfo, true);
                pinfo.pSecurityDescriptor = IntPtr.Zero;
                //Make sure the driver_Dependent part of devmode is updated...
                nRet = DocumentProperties(IntPtr.Zero, hPrinter, printerName, pinfo.pDevMode, pinfo.pDevMode,
                    DM_IN_BUFFER | DM_OUT_BUFFER);
                if (nRet <= 0)
                {
                    Marshal.FreeHGlobal(ptrPrinterInfo);
                    ClosePrinter(hPrinter);
                    return false;
                }

                // SetPrinter Update printer information
                if (!SetPrinter(hPrinter, 2, ptrPrinterInfo, 0))
                {
                    Marshal.FreeHGlobal(ptrPrinterInfo);
                    ClosePrinter(hPrinter);
                    return false;
                }

                // Notify other applications that the printer information has been changed
                IntPtr hDummy = IntPtr.Zero;
                PrinterHelper.SendMessageTimeout(
                    new IntPtr(HWND_BROADCAST), WM_SETTINGCHANGE, IntPtr.Zero, IntPtr.Zero,
                    PrinterHelper.SendMessageTimeoutFlags.SMTO_NORMAL, 1000, out hDummy);

                // free memory
                if (ptrPrinterInfo == IntPtr.Zero)
                    Marshal.FreeHGlobal(ptrPrinterInfo);
                if (hPrinter == IntPtr.Zero)
                    Marshal.FreeHGlobal(hPrinter);

                return true;
            }
        }


        /// <summary>
        /// Get the name of the default printer
        /// </summary>
        /// <returns>Returns the name of the default printer</returns>
        public static string GetDefaultPrinterName()
        {
            StringBuilder dp = new StringBuilder(256);
            int size = dp.Capacity;
            if (GetDefaultPrinter(dp, ref size))
                return dp.ToString();
            return string.Empty;
        }

        /// <summary>
        /// Get the kind of the paper, if it is 0, it is an error.
        /// </summary>
        /// <param name="printerName">The name of the printer. Passing in null or an empty string means to use the default printer.</param>
        /// <param name="paperName">Paper name, must fill in</param>
        /// <returns>kind</returns>
        public static short GetPaperKind(string printerName, string paperName)
        {
            short kind = 0;
            if (String.IsNullOrEmpty(printerName))
                printerName = GetDefaultPrinterName();
            PRINTER_INFO_5 info5;
            int requiredSize;
            int numPrinters;
            bool foundPrinter = EnumPrintersW(PRINTER_ENUM_LOCAL | PRINTER_ENUM_CONNECTIONS,
                string.Empty, 5, IntPtr.Zero, 0, out requiredSize, out numPrinters);

            int info5Size = requiredSize;
            IntPtr info5Ptr = Marshal.AllocHGlobal(info5Size);
            IntPtr buffer = IntPtr.Zero;
            try
            {
                foundPrinter = EnumPrintersW(PRINTER_ENUM_LOCAL | PRINTER_ENUM_CONNECTIONS,
                    string.Empty, 5, info5Ptr, info5Size, out requiredSize, out numPrinters);

                string port = null;
                for (int i = 0; i < numPrinters; i++)
                {
                    info5 = (PRINTER_INFO_5) Marshal.PtrToStructure(
                        (IntPtr) ((i * Marshal.SizeOf(typeof(PRINTER_INFO_5))) + (int) info5Ptr),
                        typeof(PRINTER_INFO_5));
                    if (info5.PrinterName == printerName)
                    {
                        port = info5.PortName;
                    }
                }

                int numNames = DeviceCapabilities(printerName, port, DC_PAPERNAMES, IntPtr.Zero, IntPtr.Zero);
                if (numNames < 0)
                {
                    int errorCode = GetLastError();
                    Console.WriteLine("Number of names = {1}: {0}", errorCode, numNames);
                    return 0;
                }

                buffer = Marshal.AllocHGlobal(numNames * 64);
                numNames = DeviceCapabilities(printerName, port, DC_PAPERNAMES, buffer, IntPtr.Zero);
                if (numNames < 0)
                {
                    int errorCode = GetLastError();
                    Console.WriteLine("Number of names = {1}: {0}", errorCode, numNames);
                    return 0;
                }

                string[] names = new string[numNames];
                for (int i = 0; i < numNames; i++)
                {
                    names[i] = Marshal.PtrToStringAnsi((IntPtr) ((i * 64) + (int) buffer));
                }

                Marshal.FreeHGlobal(buffer);
                buffer = IntPtr.Zero;

                int numPapers = DeviceCapabilities(printerName, port, DC_PAPERS, IntPtr.Zero, IntPtr.Zero);
                if (numPapers < 0)
                {
                    Console.WriteLine("No papers");
                    return 0;
                }

                buffer = Marshal.AllocHGlobal(numPapers * 2);
                numPapers = DeviceCapabilities(printerName, port, DC_PAPERS, buffer, IntPtr.Zero);
                if (numPapers < 0)
                {
                    Console.WriteLine("No papers");
                    return 0;
                }

                short[] kinds = new short[numPapers];
                for (int i = 0; i < numPapers; i++)
                {
                    kinds[i] = Marshal.ReadInt16(buffer, i * 2);
                }

                for (int i = 0; i < numPapers; i++)
                {
                    //                    Console.WriteLine("Paper {0} : {1}", kinds[i], names[i]);
                    if (names[i] == paperName)
                        kind = kinds[i];
                    break;
                }
            }
            finally
            {
                Marshal.FreeHGlobal(info5Ptr);
            }

            return kind;
        }


        /// <summary>
        /// Obtain all available paper, and output the paper specifications and names to the console.
        /// </summary>
        /// <param name="printerName">The name of the printer. Passing in null or an empty string means to use the default printer.</param>
        public static void ShowPapers(string printerName)
        {
            if (String.IsNullOrEmpty(printerName))
            {
                printerName = GetDefaultPrinterName();
            }

            PRINTER_INFO_5 info5;
            int requiredSize;
            int numPrinters;
            bool foundPrinter = EnumPrintersW(PRINTER_ENUM_LOCAL | PRINTER_ENUM_CONNECTIONS,
                string.Empty, 5, IntPtr.Zero, 0, out requiredSize, out numPrinters);

            int info5Size = requiredSize;
            IntPtr info5Ptr = Marshal.AllocHGlobal(info5Size);
            IntPtr buffer = IntPtr.Zero;
            try
            {
                foundPrinter = EnumPrintersW(PRINTER_ENUM_LOCAL | PRINTER_ENUM_CONNECTIONS,
                    string.Empty, 5, info5Ptr, info5Size, out requiredSize, out numPrinters);

                string port = null;
                for (int i = 0; i < numPrinters; i++)
                {
                    info5 = (PRINTER_INFO_5) Marshal.PtrToStructure(
                        (IntPtr) ((i * Marshal.SizeOf(typeof(PRINTER_INFO_5))) + (int) info5Ptr),
                        typeof(PRINTER_INFO_5));
                    if (info5.PrinterName == printerName)
                    {
                        port = info5.PortName;
                    }
                }

                int numNames = DeviceCapabilities(printerName, port, DC_PAPERNAMES, IntPtr.Zero, IntPtr.Zero);
                if (numNames < 0)
                {
                    int errorCode = GetLastError();
                    Console.WriteLine("Number of names = {1}: {0}", errorCode, numNames);
                    return;
                }

                buffer = Marshal.AllocHGlobal(numNames * 64);
                numNames = DeviceCapabilities(printerName, port, DC_PAPERNAMES, buffer, IntPtr.Zero);
                if (numNames < 0)
                {
                    int errorCode = GetLastError();
                    Console.WriteLine("Number of names = {1}: {0}", errorCode, numNames);
                    return;
                }

                string[] names = new string[numNames];
                for (int i = 0; i < numNames; i++)
                {
                    names[i] = Marshal.PtrToStringAnsi((IntPtr) ((i * 64) + (int) buffer));
                }

                Marshal.FreeHGlobal(buffer);
                buffer = IntPtr.Zero;

                int numPapers = DeviceCapabilities(printerName, port, DC_PAPERS, IntPtr.Zero, IntPtr.Zero);
                if (numPapers < 0)
                {
                    Console.WriteLine("No papers");
                    return;
                }

                buffer = Marshal.AllocHGlobal(numPapers * 2);
                numPapers = DeviceCapabilities(printerName, port, DC_PAPERS, buffer, IntPtr.Zero);
                if (numPapers < 0)
                {
                    Console.WriteLine("No papers");
                    return;
                }

                short[] kinds = new short[numPapers];
                for (int i = 0; i < numPapers; i++)
                {
                    kinds[i] = Marshal.ReadInt16(buffer, i * 2);
                }

                for (int i = 0; i < numPapers; i++)
                {
                    Console.WriteLine("Paper {0} : {1}", kinds[i], names[i]);
                }
            }
            finally
            {
                Marshal.FreeHGlobal(info5Ptr);
            }
        }

        #endregion
    }
}