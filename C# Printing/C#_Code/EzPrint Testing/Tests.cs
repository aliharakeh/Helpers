using System.Collections.Generic;
using EzPrint.Posters_Tests;
using Printing;

namespace EzPrint
{
    public static class Tests
    {
        public static readonly List<PrintingConfig> PrintingTests = new List<PrintingConfig>
        {
            // A4 Poster Tests
            A4_Poster_Tests.A4_Paper_2_Poster_Copies(),
            A4_Poster_Tests.A3_Paper_4_Poster_Copies(),
            A4_Poster_Tests.A3_Papers_2_Poster_Copies_With_Duplex(),
            A4_Poster_Tests.A2_Paper_2_Poster_Copies_With_Duplex(),
            A4_Poster_Tests.Roll_600mm_Width_5_Poster_Copies(),
            A4_Poster_Tests.Roll_600mm_Width_5_Copies_With_Duplex()

            // 180x32 PreCut Poster Tests
        };
    }
}
