using System.Drawing.Printing;
using System.IO;
using Printing;

namespace EzPrint
{
    public static class TestHelpers
    {
        public static PrinterConfig GetPrinterConfig(string printerName, PaperSize paperSize, bool duplex = false,
            string devmodePath = "", string tray = "", PrinterResolution resolution = null)
        {
            return new PrinterConfig
            {
                PrinterName = printerName,
                PaperName = paperSize.PaperName,
                RawKind = paperSize.RawKind,
                Width = paperSize.Width,
                Height = paperSize.Height,
                Kind = paperSize.PaperName,
                DevmodePath = devmodePath,
                Duplex = duplex,
                SourceName = tray,
                ResX = resolution?.X ?? -1,
                ResY = resolution?.Y ?? -1
            };
        }

        public static PosterConfig GetPosterConfig(PaperSize paperSize, int copies = 1,
            bool duplex = false,
            bool cutMarks = false, bool keepDimensions = false, PreCutInfo preCutInfo = null)
        {
            return new PosterConfig
            {
                SvgString = "",
                PaperName = paperSize.PaperName,
                Width = paperSize.Width,
                Height = paperSize.Height,
                Copies = copies,
                Duplex = duplex,
                CutMarks = cutMarks,
                KeepDimensions = keepDimensions,
                PreCutInfo = preCutInfo ?? new PreCutInfo()
            };
        }
    }
}
