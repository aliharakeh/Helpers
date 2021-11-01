using Printing;

namespace EzPrint.Posters_Tests
{
    public static class A4_Poster_Tests
    {
        public static PrintingConfig A4_Paper_2_Poster_Copies()
        {
            return new PrintingConfig
            {
                PrinterConfig = TestHelpers.GetPrinterConfig(Printers.DEFAULT, Papers.A4),
                PosterConfig = TestHelpers.GetPosterConfig(Papers.A4, copies: 2)
            };
        }

        public static PrintingConfig A3_Paper_4_Poster_Copies()
        {
            return new PrintingConfig
            {
                PrinterConfig = TestHelpers.GetPrinterConfig(Printers.DEFAULT, Papers.A3),
                PosterConfig = TestHelpers.GetPosterConfig(Papers.A4, copies: 4)
            };
        }

        public static PrintingConfig A3_Papers_2_Poster_Copies_With_Duplex()
        {
            return new PrintingConfig
            {
                PrinterConfig = TestHelpers.GetPrinterConfig(Printers.DEFAULT, Papers.A3),
                PosterConfig = TestHelpers.GetPosterConfig(Papers.A4, copies: 2, duplex: true)
            };
        }

        public static PrintingConfig A2_Paper_2_Poster_Copies_With_Duplex()
        {
            return new PrintingConfig
            {
                PrinterConfig = TestHelpers.GetPrinterConfig(Printers.DEFAULT, Papers.A2),
                PosterConfig = TestHelpers.GetPosterConfig(Papers.A4, copies: 2, duplex: true)
            };
        }

        public static PrintingConfig Roll_600mm_Width_5_Poster_Copies()
        {
            return new PrintingConfig
            {
                PrinterConfig = TestHelpers.GetPrinterConfig(Printers.DEFAULT, Papers.Roll(600)),
                PosterConfig = TestHelpers.GetPosterConfig(Papers.A4, copies: 5)
            };
        }

        public static PrintingConfig Roll_600mm_Width_5_Copies_With_Duplex()
        {
            return new PrintingConfig
            {
                PrinterConfig = TestHelpers.GetPrinterConfig(Printers.DEFAULT, Papers.Roll(600)),
                PosterConfig = TestHelpers.GetPosterConfig(Papers.A4, copies: 5, duplex: true)
            };
        }
    }
}
