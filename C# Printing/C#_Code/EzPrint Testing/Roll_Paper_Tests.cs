using Printing;
using Printers = EzPrint.Printers;

namespace EzPrint
{
    public class Roll_Paper_Tests
    {
        public static PrintingConfig A4_Poster_600_Width_5_Copies()
        {
            return new PrintingConfig
            {
                PrinterConfig = TestHelpers.GetPrinterConfig(Printers.DEFAULT, Papers.Roll(600)),
                PosterConfig = TestHelpers.GetPosterConfig(Papers.A4(), copies: 5)
            };
        }

        public static PrintingConfig A4_Poster_600_Width_5_Copies_With_Duplex()
        {
            return new PrintingConfig
            {
                PrinterConfig = TestHelpers.GetPrinterConfig(Printers.DEFAULT, Papers.Roll(600)),
                PosterConfig = TestHelpers.GetPosterConfig(Papers.A4(), copies: 5, duplex: true)
            };
        }
    }
}
