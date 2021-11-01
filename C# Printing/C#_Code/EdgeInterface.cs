using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Printing
{
    public class EdgeInterface
    {
        public async Task<object> GetInstalledPrinters(object input)
        {
            return Helpers.ToJson(Printers.GetInstalledPrinters());
        }

        public async Task<object> GetPrinterCapabilities(string printerName)
        {
            return Helpers.ToJson(Printers.GetPrinterCapabilities(printerName));
        }

        public async Task<object> OpenPropertiesDialog(dynamic data)
        {
            Logging.Debug(data);
            var windowData = (byte[]) data.window;
            var window = new byte[8];
            for (var i = 0; i < windowData.Length; i++)
                window[i] = windowData[i];

            return Printers.OpenPropertiesDialog(
                (string) data.printerName,
                (string) data.devmodePath,
                window
            );
        }

        public async Task<object> Print(dynamic data)
        {
            try
            {
                var successful = new List<PrintingConfig>();
                var failed = new List<PrintingConfig>();
                foreach (var config in data)
                {
                    var printingConfig = new PrintingConfig(config);
                    DirectPrint directPrint = new DirectPrint(printingConfig);

                    Logging.Info($"Printing on [{printingConfig.PrinterConfig.PrinterName}]");
                    Logging.Info(
                        $"Processing {printingConfig.TotalPosterCopies} [{printingConfig.FormatConfig.Name}] Poster(s) on [{printingConfig.PrinterConfig.PaperName}] Paper"
                    );

                    var printed = directPrint.Print();

                    if (printed) successful.Add(printingConfig);
                    else failed.Add(printingConfig);
                }

                Logging.Info($"Successful Printings: {successful.Count}");
                Logging.Warning($"Failed Printings: {failed.Count}");

                return Helpers.ToJson(new
                {
                    successful,
                    failed
                });
            }
            catch (Exception e)
            {
                Logging.Error(e.Message + e.StackTrace);
                throw;
            }
            finally
            {
                Logging.SaveLog();
            }
        }
    }
}