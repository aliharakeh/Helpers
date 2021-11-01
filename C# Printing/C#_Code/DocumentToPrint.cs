using System;
using System.Drawing.Printing;
using System.Linq;

namespace Printing
{
    public class DocumentToPrint
    {
        private readonly PrinterConfig _printerConfig;
        private readonly PrintDocument _document;

        public DocumentToPrint(PrinterConfig printerConfig)
        {
            _printerConfig = printerConfig;
            _document = new PrintDocument
            {
                PrinterSettings =
                {
                    PrinterName = printerConfig.PrinterName
                }
            };
            OverridePrinterConfig();

            if (_printerConfig.IsRollPaper()) SetRollSize();
            else SetPaperSize();

            SetResolution();
            SetTraySource();
        }

        public DocumentToPrint(string printerName)
        {
            _document = new PrintDocument();
            _document.PrinterSettings.PrinterName = printerName;
        }

        public PrintDocument GetDocument() => _document;

        private void OverridePrinterConfig()
        {
            IntPtr devmode = Helpers.LoadConfig(_printerConfig.DevmodePath);
            if (devmode == IntPtr.Zero) return;
            _document.PrinterSettings.SetHdevmode(devmode);
            _document.PrinterSettings.DefaultPageSettings.SetHdevmode(devmode);
        }

        private void SetRollSize()
        {
            var width = _printerConfig.Width;
            var height = _printerConfig.Height;
            var rawKind = 256; // custom paper
            var landscape = false; // so that our calculation don't break
            _document.DefaultPageSettings.PaperSize = new PaperSize("Roll", width, height);
            _document.DefaultPageSettings.PaperSize.RawKind = rawKind;
            _document.PrinterSettings.DefaultPageSettings.PaperSize.RawKind = rawKind;
            _document.DefaultPageSettings.Landscape = landscape;
        }

        private void SetPaperSize()
        {
            try
            {
                PaperSize paperSize;
                
                if (_printerConfig.IsPreCutPaper())
                    paperSize = (
                        from size in _document.PrinterSettings.PaperSizes.Cast<PaperSize>()
                        where size.Width == _printerConfig.Width && size.Height == _printerConfig.Height
                        select size
                    ).First();

                else
                    paperSize = (
                        from size in _document.PrinterSettings.PaperSizes.Cast<PaperSize>()
                        where size.RawKind == _printerConfig.RawKind
                        select size
                    ).First();

                _document.PrinterSettings.DefaultPageSettings.PaperSize = paperSize;
                _document.DefaultPageSettings.PaperSize = paperSize;
            }
            catch (Exception e)
            {
            }
        }

        private void SetResolution()
        {
            try
            {
                if (_printerConfig.ResX == -1 || _printerConfig.ResY == -1)
                    return;

                PrinterResolution resolution = (
                    from res in _document.PrinterSettings.PrinterResolutions.Cast<PrinterResolution>()
                    where res.X == _printerConfig.ResX && res.Y == _printerConfig.ResY
                    select res
                ).First();
                _document.PrinterSettings.DefaultPageSettings.PrinterResolution = resolution;
                _document.DefaultPageSettings.PrinterResolution = resolution;
            }
            catch (Exception e)
            {
            }
        }

        private void SetTraySource()
        {
            try
            {
                PaperSource tray = (
                    from source in _document.PrinterSettings.PaperSources.Cast<PaperSource>()
                    where source.SourceName == _printerConfig.SourceName
                    select source
                ).First();
                _document.PrinterSettings.DefaultPageSettings.PaperSource = tray;
                _document.DefaultPageSettings.PaperSource = tray;
            }
            catch (Exception e)
            {
            }
        }
    }
}