using System;
using System.Collections.Generic;
using System.Drawing.Printing;
using System.Linq;


namespace Printing
{
    public static class Printers
    {
        public static List<string> GetInstalledPrinters()
        {
            return Helpers.ToList(PrinterSettings.InstalledPrinters);
        }

        public static Dictionary<string, dynamic> GetPrinterCapabilities(string printerName)
        {
            var printerSettings = Helpers.GetPrinterSettings(printerName);
            PrintDocument document = new DocumentToPrint(printerName).GetDocument();
            var capabilities = new Dictionary<string, dynamic>();
            
            capabilities.Add("pageSizes", GetPaperSizes(printerSettings));
            capabilities.Add("resolutions", GetResolutions(printerSettings));
            capabilities.Add("trays", GetTrays(printerSettings));
            capabilities.Add("hasDuplex", HasDuplex(printerName));
            capabilities.Add("printableArea",
                Helpers.GetPropertyDict(
                    document.DefaultPageSettings.PrintableArea, 
                    new List<string> {"Top", "Left"}
                )
            );
            return capabilities;
        }

        public static int OpenPropertiesDialog(string printerName, string configPath, byte[] windowData)
        {
            var window =  (IntPtr) BitConverter.ToUInt64(windowData, 0);
            return PropertiesDialog.Open(printerName, configPath, window);
        }

        private static dynamic GetPaperSizes(PrinterSettings printerSettings)
        {
            return Helpers.GetPropertiesList(
                printerSettings.PaperSizes,
                new List<string> {"PaperName", "Kind", "Width", "Height", "RawKind"}
            );
        }

        private static dynamic GetResolutions(PrinterSettings printerSettings)
        {
            var resolutions = Helpers.GetPropertiesList(
                printerSettings.PrinterResolutions,
                new List<string> {"Kind", "X", "Y"}
            );
            var filteredResolutions = (
                from res in resolutions
                where res["X"] > 0 && res["Y"] > 0
                select res
            );
            return filteredResolutions.ToList();
        }

        private static dynamic GetTrays(PrinterSettings printerSettings)
        {
            return Helpers.GetPropertiesList(printerSettings.PaperSources, new List<string> {"SourceName"});
        }

        private static bool HasDuplex(string printerName)
        {
            return Helpers.GetPrinterSettings(printerName).CanDuplex;
        }
    }
}