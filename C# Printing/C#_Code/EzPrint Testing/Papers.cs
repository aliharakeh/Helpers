using System.Drawing.Printing;
using Printing;

namespace EzPrint
{
    public static class Papers
    {
        private const int CUSTOM_PAPER = 256;

        public static readonly PaperSize A4 = new PaperSize
        {
            PaperName = "A4",
            RawKind = (int) PaperKind.A4,
            Width = Helpers.Mm_To_100th_Of_Inch(210),
            Height = Helpers.Mm_To_100th_Of_Inch(297),
        };

        public static readonly PaperSize A3 = new PaperSize
        {
            PaperName = "A3",
            RawKind = (int) PaperKind.A3,
            Width = Helpers.Mm_To_100th_Of_Inch(297),
            Height = Helpers.Mm_To_100th_Of_Inch(420),
        };

        public static readonly PaperSize A2 = new PaperSize
        {
            PaperName = "A2",
            RawKind = (int) PaperKind.A2,
            Width = Helpers.Mm_To_100th_Of_Inch(420),
            Height = Helpers.Mm_To_100th_Of_Inch(594),
        };

        public static readonly PaperSize A1 = new PaperSize
        {
            PaperName = "A1",
            RawKind = CUSTOM_PAPER,
            Width = Helpers.Mm_To_100th_Of_Inch(594),
            Height = Helpers.Mm_To_100th_Of_Inch(841),
        };

        public static PaperSize Roll(int width)
        {
            return new PaperSize
            {
                PaperName = "Roll",
                RawKind = CUSTOM_PAPER,
                Width = Helpers.Mm_To_100th_Of_Inch(width),
                Height = -1,
            };
        }
    }
}
