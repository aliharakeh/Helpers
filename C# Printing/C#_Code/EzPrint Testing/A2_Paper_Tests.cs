using Printing;

namespace EzPrint
{
    public class A2_Paper_Tests
    {
        public static PrintingConfig A4_Poster_2_Copies_With_Duplex()
        {
            return new PrintingConfig
            {
                PrinterConfig = TestHelpers.GetPrinterConfig(Printers.DEFAULT, Papers.A2()),
                PosterConfig = TestHelpers.GetPosterConfig(Papers.A4(), copies: 2)
            };
        }
    }
}
