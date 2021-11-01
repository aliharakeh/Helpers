using Printing;

namespace EzPrint
{
    public class A3_Paper_Tests
    {
        public static PrintingConfig A4_Poster_4_Copies()
        {
            return new PrintingConfig
            {
                PrinterConfig = TestHelpers.GetPrinterConfig(Printers.DEFAULT, Papers.A3()),
                PosterConfig = TestHelpers.GetPosterConfig(Papers.A4(), copies: 4)
            };
        }

        public static PrintingConfig A4_Poster_2_Copies_With_Duplex()
        {
            return new PrintingConfig
            {
                PrinterConfig = TestHelpers.GetPrinterConfig(Printers.DEFAULT, Papers.A3()),
                PosterConfig = TestHelpers.GetPosterConfig(Papers.A4(), copies: 2, duplex: true)
            };
        }
    }
}
