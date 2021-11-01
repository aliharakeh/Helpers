using System.Drawing.Printing;
using Svg;
using Svg.Transforms;
using System;
using System.Drawing;
using System.Linq;

namespace Printing
{
    public class BaseSvg : SvgDocument
    {
        protected PrintingConfig PrintingConfig;
        protected PrintDocument DocumentToPrint;
        private bool _hasMorePages = false;
        private bool _isRotated = false;

        protected BaseSvg()
        {
        }

        protected BaseSvg(PrintingConfig printingConfig)
        {
            PrintingConfig = printingConfig;
        }

        protected void Rotate(float angle, float centerX, float centerY, float translateX = 0,
            float translateY = 0)
        {
            if (Transforms == null) Transforms = new SvgTransformCollection();
            Transforms.Add(new SvgRotate(angle, centerX, centerY));
            Transforms.Add(new SvgTranslate(translateX, translateY));
        }

        protected void AutoRotate(float angle)
        {
            if (Transforms == null) Transforms = new SvgTransformCollection();
            var centerX = X.Value;
            var centerY = Y.Value;
            var translateX = 0.0f;
            var translateY = 0.0f;
            
            switch (angle)
            {
                case 90:
                    translateY -= Height.Value;
                    break;
                
                case -90:
                    translateX -= Height.Value;
                    break;
                
                case 180:
                    centerX += Width.Value / 2;
                    centerY += Height.Value / 2;
                    break;
                
                default:
                    break;
            }
            
            Transforms.Add(new SvgRotate(angle, centerX, centerY));
            Transforms.Add(new SvgTranslate(translateX, translateY));
        }

        protected void Resize(float width, float height)
        {
            Width = width;
            Height = height;
        }

        public void AddChild(BaseSvg child)
        {
            Children.Add(child);
        }

        public void Print(bool isRotated)
        {
            Logging.Info("BaseSvg.Print");

            _isRotated = isRotated;

            DocumentToPrint = new DocumentToPrint(PrintingConfig.PrinterConfig).GetDocument();
            if (PrintingConfig.PrinterDuplex())
            {
                _hasMorePages = PrintingConfig.PrinterConfig.Duplex;
                DocumentToPrint.PrinterSettings.Duplex = Duplex.Vertical;
            }

            DocumentToPrint.PrintPage += new PrintPageEventHandler(PrintPageHandler);
            DocumentToPrint.Print();
        }

        private (float, float) PrintableAreaBounds()
        {
            var printableArea = DocumentToPrint.DefaultPageSettings.PrintableArea;
            var width = Width.Value - printableArea.Left * 2;
            var height = Height.Value - printableArea.Top * 2;
            return (width, height);
        }

        private void DrawSvg(Graphics graphics, bool shouldScale)
        {
            var (width, height) = PrintableAreaBounds();
            var printableScaleX = width / Width.Value;
            var printableScaleY = height / Height.Value;
            
            if (shouldScale) graphics.ScaleTransform(printableScaleX, printableScaleY);
            
            Draw(graphics);

            // var printableScaleXReverse = Width.Value / width;
            // var printableScaleYReverse = Height.Value / height;
            // if (shouldScale) graphics.ScaleTransform(printableScaleXReverse, printableScaleYReverse);
        }

        private void PrintPageHandler(object sender, PrintPageEventArgs ev)
        {
            Logging.Info("BaseSvg.PrintPageHandler");

            // draw svg on paper
            try
            {
                Logging.Info("BaseSvg.PrintPageHandler Before Draw");
                
                // fix full duplex rotation
                if (PrintingConfig.PrinterDuplex() && !_hasMorePages && _isRotated)
                    foreach (var child in Children.Cast<BaseSvg>())
                        child.AutoRotate(180);
                
                DrawSvg(ev.Graphics, PrintingConfig.ShouldScale());
                
                Logging.Info("BaseSvg.PrintPageHandler After Draw");

                if (!PrintingConfig.PrinterDuplex()) return;

                ev.HasMorePages = _hasMorePages;
                _hasMorePages = false;
                return;
            }
            catch (Exception ex)
            {
                Logging.Error($"Error In Draw: {ex.Message}");
                Logging.Error($"Error In Draw: {ex.Source}");
                Logging.Error($"Error In Draw: {ex.StackTrace}");
            }
        }
    }
}