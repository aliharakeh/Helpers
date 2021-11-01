namespace Printing
{
    public class PreCutPaper : Paper
    {
        private PreCutInfo _preCutInfo;

        public PreCutPaper(PrintingConfig printingConfig) : base(printingConfig)
        {
            _preCutInfo = PrintingConfig.FormatConfig.PreCutInfo;
        }

        protected override CountInfo PostersInfo(int paperWidth, int paperHeight, int posterWidth,
            int posterHeight)
        {
            if (_preCutInfo == null) _preCutInfo = PrintingConfig.FormatConfig.PreCutInfo;
            
            var countPerWidth = PostersPerLength(paperWidth, posterWidth, _preCutInfo.MarginX,
                _preCutInfo.GapX);

            var countPerHeight = PostersPerLength(paperHeight, posterHeight, _preCutInfo.MarginY,
                _preCutInfo.GapY);

            var countPerPaper = countPerWidth * countPerHeight;

            return new CountInfo(countPerWidth, countPerHeight, countPerPaper);
        }
        
        private int PostersPerLength(int paperLength, int posterLength, int margin, int spacing)
        {
            // apply margins
            var marginedPaperLength = paperLength - margin * 2;

            // 0 or 1 poster per length
            var countPerLength = marginedPaperLength / posterLength;
            if (countPerLength <= 1) return countPerLength;

            // reset
            countPerLength = 0;
            var spacedPosterLength = posterLength + spacing;

            // increment the counter as long as we can add a poster, then add poster with spacing
            var totalPostersLength = 0;
            while (totalPostersLength + posterLength <= marginedPaperLength)
            {
                countPerLength++;
                totalPostersLength += spacedPosterLength;
            }

            return countPerLength;
        }

        public override (int, int) GetOrigins()
        {
            return (_preCutInfo.MarginX, _preCutInfo.MarginY);
        }
    }
}