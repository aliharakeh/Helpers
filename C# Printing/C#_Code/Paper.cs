using System.Collections.Generic;

namespace Printing
{
    public class Paper : BaseSvg
    {
        public readonly PaperInfo PaperInfo;

        public Paper(PrintingConfig printingConfig) : base(printingConfig)
        {
            var (width, height) = printingConfig.PaperSize();
            Resize(width, height);

            // get content information
            PaperInfo = PrintingConfig.ManualDuplex() ? ManualDuplexInfo() : Info();
        }

        private PaperInfo Info()
        {
            var (paperWidth, paperHeight) = PrintingConfig.PrintablePaperSize();
            var (posterWidth, posterHeight) = PrintingConfig.FormatSize();

            var normalPostersInfo = PostersInfo(paperWidth, paperHeight, posterWidth, posterHeight);
            var rotatedPostersInfo = PostersInfo(paperWidth, paperHeight, posterHeight, posterWidth);

            var shouldRotate = ShouldRotate(normalPostersInfo, rotatedPostersInfo);
            var countInfo = shouldRotate ? rotatedPostersInfo : normalPostersInfo;

            var info = new PaperInfo
            {
                PostersPerPaper = countInfo.CountPerPaper,
                PostersPerWidth = countInfo.CountPerWidth,
                PostersPerHeight = countInfo.CountPerHeight,
                DuplexMode = shouldRotate ? (DuplexMode) new RotatedNoneDuplex() : new NoneDuplex()
            };

            return info;
        }

        private PaperInfo ManualDuplexInfo()
        {
            var paperInfoList = new List<PaperInfo>
            {
                DuplexPaperInfo(new SideBySideDuplex()),
                DuplexPaperInfo(new RotatedSideBySideDuplex()),
                DuplexPaperInfo(new TopBottomDuplex()),
                DuplexPaperInfo(new RotatedTopBottomDuplex())
            };

            var paperInfo = paperInfoList[0];
            for (var i = 1; i < paperInfoList.Count; i++)
                if (paperInfoList[i].PostersPerPaper > paperInfo.PostersPerPaper)
                    paperInfo = paperInfoList[i];

            return paperInfo;
        }

        protected virtual CountInfo PostersInfo(int paperWidth, int paperHeight, int posterWidth,
            int posterHeight)
        {
            var countPerWidth = paperWidth / posterWidth;
            var countPerHeight = paperHeight / posterHeight;
            var countPerPaper = countPerWidth * countPerHeight;
            return new CountInfo(countPerWidth, countPerHeight, countPerPaper);
        }

        private PaperInfo DuplexPaperInfo(DuplexMode duplexMode)
        {
            var (paperWidth, paperHeight) = PrintingConfig.PrintablePaperSize();
            var (posterWidth, posterHeight) = PrintingConfig.PosterDuplexSize(duplexMode);

            var countInfo = PostersInfo(paperWidth, paperHeight, posterWidth, posterHeight);
            return new PaperInfo
            {
                PostersPerPaper = countInfo.CountPerPaper,
                PostersPerWidth = countInfo.CountPerWidth,
                PostersPerHeight = countInfo.CountPerHeight,
                DuplexMode = duplexMode
            };
        }

        protected virtual bool ShouldRotate(CountInfo normalPostersInfo, CountInfo rotatedPostersInfo)
        {
            // which mode provide posters per page more than the other
            return rotatedPostersInfo.CountPerPaper > normalPostersInfo.CountPerPaper;
        }

        public virtual (int, int) GetOrigins()
        {
            return (0, 0);
        }
    }
}