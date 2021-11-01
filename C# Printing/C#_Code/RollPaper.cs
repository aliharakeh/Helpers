namespace Printing
{
    public class RollPaper : Paper
    {
        public RollPaper(PrintingConfig printingConfig) : base(printingConfig)
        {
            UpdateHeight();
        }

        protected override CountInfo PostersInfo(int paperWidth, int paperHeight, int posterWidth,
            int posterHeight)
        {
            var countPerWidth = paperWidth / posterWidth;
            return countPerWidth == 0 ? new CountInfo(0, 0, 0) : new CountInfo(countPerWidth, 1, countPerWidth);
        }

        protected override bool ShouldRotate(CountInfo normalPostersInfo, CountInfo rotatedPostersInfo)
        {
            // which prints more
            if (rotatedPostersInfo.CountPerPaper != normalPostersInfo.CountPerPaper)
                return rotatedPostersInfo.CountPerPaper > normalPostersInfo.CountPerPaper;

            // get width / height of poster
            var (posterWidth, posterHeight) = PrintingConfig.FormatSize();
            
            // see which waste less whitespace
            var normalTotalWidth = normalPostersInfo.CountPerPaper * posterWidth;
            var rotatedTotalWidth = rotatedPostersInfo.CountPerPaper * posterHeight;
            return rotatedTotalWidth > normalTotalWidth;
        }

        private void UpdateHeight()
        {
            var (_, posterHeight) = PrintingConfig.PosterDuplexSize(PaperInfo.DuplexMode);
            Height = posterHeight;
            PrintingConfig.UpdatePaperHeight(posterHeight);
        }
    }
}