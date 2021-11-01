using System;

namespace Printing
{
    public class DirectPrint
    {
        private readonly PrintingConfig _printingConfig;
        private readonly FormatConfig _formatConfig;
        private readonly PrinterConfig _printerConfig;

        public DirectPrint(PrintingConfig printingConfig)
        {
            // reference needed data to ease access to them
            _printingConfig = printingConfig;
            _formatConfig = _printingConfig.FormatConfig;
            _printerConfig = _printingConfig.PrinterConfig;
        }

        public bool Print()
        {
            // initialize first printed page
            var paper = PaperFactory.NewPaper(_printingConfig);
            var paperInfo = paper.PaperInfo;
            var isRoll = _printerConfig.IsRollPaper();
            Logging.Info(paperInfo);

            var neededPapers = GetNeededPapers(paperInfo);

            if (neededPapers == 0)
            {
                Logging.Warning("Printing Failed!! [Cause]: Poster's Size doesn't match Paper's Size");
                return false;
            }

            Logging.Info($"Printing {neededPapers} Paper(s) ({paperInfo.PostersPerPaper} Poster(s) per Paper)");

            for (var papers = 0; papers < neededPapers; papers++)
            {
                // get remaining posters
                var printedPosters = paperInfo.PostersPerPaper * papers;
                var remainingPosters = _printingConfig.TotalPosterCopies - printedPosters;

                // use default page posters as a default value
                var paperPosters = paperInfo.PostersPerPaper;

                // last remaining posters to print
                if (remainingPosters < paperPosters)
                {
                    // update paper posters count
                    paperPosters = remainingPosters;

                    // in case of a roll paper, we will reCheck poster rotation and update paper size to not
                    // waste any whitespace
                    if (isRoll && !_printingConfig.ManualDuplex())
                    {
                        // calculate new shouldRotate
                        var shouldRotate = ShouldRotate(remainingPosters);
                        paperInfo.DuplexMode = shouldRotate ? (DuplexMode) new RotatedNoneDuplex() : new NoneDuplex();

                        // update custom roll paper size to match the rotate update
                        var (width, height) = _printingConfig.FormatSize();
                        _printingConfig.UpdatePaperHeight(paperInfo.DuplexMode.IsRotated ? width : height);
                    }
                }

                // print page
                PrintPaper(paper, paperInfo, paperPosters);

                // initialize next printed page (same config ==> same pagesInfo)
                paper.Children.Clear();
            }

            return true;
        }

        private int GetNeededPapers(PaperInfo paperInfo)
        {
            if (paperInfo.PostersPerPaper == 0) return 0;
            return (int) Math.Ceiling(_printingConfig.TotalPosterCopies * 1.0 / paperInfo.PostersPerPaper);
        }

        private bool ShouldRotate(int remainingPosters)
        {
            // which one waste less whitespace from roll width
            var (posterWidth, posterHeight) = _printingConfig.FormatSize();
            var normalTotalWidth = remainingPosters * posterWidth;
            var rotatedTotalWidth = remainingPosters * posterHeight;
            return rotatedTotalWidth > normalTotalWidth;
        }

        private void PrintPaper(Paper paper, PaperInfo paperInfo, int paperPosters)
        {
            // initialize poster data
            var (originX, originY) = paper.GetOrigins();
            var x = originX;
            var y = originY;

            var (posterWidth, posterHeight) = _printingConfig.PosterDuplexSize(paperInfo.DuplexMode);
            var moveX = CalculateMoveX(posterWidth);
            var moveY = CalculateMoveY(posterHeight);

            // iterate rows
            for (var postersRow = 0; postersRow < paperInfo.PostersPerHeight; postersRow++)
            {
                // get remaining posters
                var remainingPosters = paperPosters - paperInfo.PostersPerWidth * postersRow;

                // get row posters
                var rowPosters = paperInfo.PostersPerWidth;
                if (remainingPosters < rowPosters) rowPosters = remainingPosters;

                for (var rowPoster = 0; rowPoster < rowPosters; rowPoster++)
                {
                    var poster = Poster.Create(paperInfo, _printingConfig);
                    poster.X = x;
                    poster.Y = y;

                    paper.AddChild(poster);

                    x += moveX;
                }

                x = originX;
                y += moveY;
            }

            paper.Print(paperInfo.DuplexMode.IsRotated);
        }

        private int CalculateMoveX(int width)
        {
            var spacing = _formatConfig.PreCutInfo.GapX;
            return width + spacing;
        }

        private int CalculateMoveY(int height)
        {
            var spacing = _formatConfig.PreCutInfo.GapY;
            return height + spacing;
        }
    }
}