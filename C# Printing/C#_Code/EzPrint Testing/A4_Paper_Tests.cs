using Printing;

namespace EzPrint
{
    public static class A4_Paper_Tests
    {
        public static PrintingConfig A4_Poster_2_Copies()
        {
            var A4 = Papers.A4();
            return new PrintingConfig
            {
                PrinterConfig = TestHelpers.GetPrinterConfig(Printers.DEFAULT, A4),
                PosterConfig = TestHelpers.GetPosterConfig(A4, copies: 2)
            };
        }
    }
}
