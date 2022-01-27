using System.Collections.Generic;
using System.Linq;
using Svg;

namespace Printing
{
    public class Poster : BaseSvg
    {
        public Poster()
        {
        }

        public Poster(PrintingConfig printingConfig) : base(printingConfig)
        {
        }

        private Poster GeneratePoster(int x, int y, PosterConfig posterConfig, int rotationAngle)
        {
            // create
            var posterSvg = FromSvg<Poster>(posterConfig.Svg);

            // set coordinates
            posterSvg.X = x;
            posterSvg.Y = y;

            // scale
            var (width, height) = PrintingConfig.FormatSize();
            if (!posterConfig.MatchOrientation)
                (width, height) = (height, width);
            posterSvg.Resize(width, height);

            // rotate
            posterSvg.AutoRotate(rotationAngle);

            if (PrintingConfig.SamePaperColor(posterConfig))
            {
                var background = posterSvg.GetElementById("background");
                if (background != null)
                {
                    var parent = background.Parent;
                    parent.Children.Remove(background);
                }
            }

            return posterSvg;
        }

        public static Poster Create(PaperInfo pagesInfo, PrintingConfig printingConfig)
        {
            // poster config
            var posterConfig = printingConfig.Posters.Dequeue();

            // create poster container
            var posterContainer = new Poster(printingConfig);

            // get rotation angles according to the duplex mode
            var duplexMode = pagesInfo.DuplexMode;
            var (angle1, angle2) = duplexMode.GetRotationAngles(posterConfig.MatchOrientation);

            // create poster and add it
            var poster = posterContainer.GeneratePoster(0, 0, posterConfig, angle1);

            // create & add duplex poster
            Poster duplexPoster = null;
            if (printingConfig.ManualDuplex())
            {
                var (posterWidth, postereHeight) = printingConfig.FormatSize();
                (posterWidth, postereHeight) =
                    duplexMode.IsRotated ? (postereHeight, posterWidth) : (posterWidth, postereHeight);

                var sideBySideDuplex = duplexMode.WidthFactor == 2;

                var x = sideBySideDuplex ? posterWidth : 0;
                var y = sideBySideDuplex ? 0 : postereHeight;

                duplexPoster = posterContainer.GeneratePoster(x, y, posterConfig, angle2);
            }

            // scale poster container with already updated final poster size
            var (width, height) = printingConfig.PosterDuplexSize(duplexMode);
            posterContainer.Resize(width, height);

            // add content
            posterContainer.DrawCuttingLines(width, height);
            posterContainer.AddChild(poster);
            if (duplexPoster != null) posterContainer.AddChild(poster);

            return posterContainer;
        }

        private void DrawCuttingLines(int width, int height)
        {
            var points = new List<(SvgUnit, SvgUnit)>
            {
                (0, 0),
                (width, 0),
                (0, height),
                (width, height)
            };

            foreach (var point in points)
            {
                if (PrintingConfig.FormatConfig.CutMarks)
                {
                    foreach (var line in DrawCuttingMark(point.Item1, point.Item2))
                    {
                        Children.Add(line);
                    }
                }

                var circle = new SvgCircle
                {
                    CenterX = point.Item1,
                    CenterY = point.Item2,
                    Radius = 1,
                    Stroke = new SvgColourServer(System.Drawing.Color.Azure),
                    Fill = new SvgColourServer(System.Drawing.Color.Azure),
                };
                Children.Add(circle);
            }
        }

        private List<SvgLine> DrawCuttingMark(SvgUnit x, SvgUnit y)
        {
            var farFromOriginBy = 1;
            var lineLength = 20;
            var correctLineLength = farFromOriginBy + lineLength;

            var points = new List<(SvgUnit, SvgUnit, SvgUnit, SvgUnit)>
            {
                (x + farFromOriginBy, y, x + correctLineLength, y),
                (x - farFromOriginBy, y, x - correctLineLength, y),
                (x, y + farFromOriginBy, x, y + correctLineLength),
                (x, y - farFromOriginBy, x, y - correctLineLength)
            };

            var lines = new List<SvgLine>();
            foreach (var point in points)
            {
                var line = new SvgLine
                {
                    StartX = point.Item1,
                    StartY = point.Item2,
                    EndX = point.Item3,
                    EndY = point.Item4,
                    StrokeWidth = 2,
                    Stroke = new SvgColourServer(System.Drawing.Color.Black)
                };
                lines.Add(line);
            }

            return lines;
        }
    }
}