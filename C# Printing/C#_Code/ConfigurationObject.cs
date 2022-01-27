using System;
using System.Collections.Generic;

namespace Printing
{
    public class PrintingConfig
    {
        public PrinterConfig PrinterConfig;
        public FormatConfig FormatConfig;
        public Queue<PosterConfig> Posters;
        public List<String> PosterIds;
        public int TotalPosterCopies;

        public PrintingConfig(dynamic printingConfig)
        {
            PrinterConfig = new PrinterConfig(printingConfig.printerConfig);
            FormatConfig = new FormatConfig(printingConfig.formatConfig);
            Posters = new Queue<PosterConfig>();
            PosterIds = new List<string>();
            TotalPosterCopies = 0;

            foreach (var poster in printingConfig.posters)
            {
                var posterConfig = new PosterConfig(poster);
                PosterIds.Add(posterConfig.Id);
                TotalPosterCopies += posterConfig.Copies;
                for (var copy = 0; copy < posterConfig.Copies; copy++)
                    Posters.Enqueue(posterConfig);
            }
        }

        public (int, int) PaperSize() => PrinterConfig.PaperSize();

        public (int, int) FormatSize() => FormatConfig.FormatSize();

        public bool PrinterDuplex() => FormatConfig.Duplex && PrinterConfig.Duplex;

        public bool ManualDuplex() => FormatConfig.Duplex && !PrinterConfig.Duplex;

        public bool ShouldScale() => !FormatConfig.KeepDimensions;

        public bool IsRollPaper() => PrinterConfig.IsRollPaper();

        public bool IsPreCutPaper() => PrinterConfig.IsPreCutPaper();

        public (int, int) PrintablePaperSize()
        {
            var (width, height) = PaperSize();

            // let the svg auto scale posters when scaled according to the printable area when printed
            if (ShouldScale())
                return (width, height);

            // manual fitting
            var document = new DocumentToPrint(PrinterConfig.PrinterName).GetDocument();
            var printableArea = document.DefaultPageSettings.PrintableArea;
            return (
                width - (int) Math.Ceiling(printableArea.Left),
                height - (int) Math.Ceiling(printableArea.Top)
            );
        }

        public bool SamePaperColor(PosterConfig posterConfig) => PrinterConfig.PaperColor == posterConfig.PaperColor; 

        public void UpdatePaperHeight(int height) => PrinterConfig.Height = height;

        public (int, int) PosterDuplexSize(DuplexMode duplexMode)
        {
            var (posterWidth, posterHeight) = FormatSize();
            return duplexMode.GetUpdatedPosterSize(posterWidth, posterHeight);
        }
    }

    public class PrinterConfig
    {
        public string PrinterName;
        public string DevmodePath;
        public string PaperColor;
        public string PaperName;
        public string Kind;
        public int RawKind;
        public int Width;
        public int Height;
        public int ResX;
        public int ResY;
        public string SourceName;
        public bool Duplex;

        public PrinterConfig(dynamic printerConfig)
        {
            PrinterName = (string) printerConfig.printerName;
            DevmodePath = (string) printerConfig.devmodePath;
            PaperColor = (string) printerConfig.paperColor;
            PaperName = (string) printerConfig.paperName;
            Kind = (string) printerConfig.kind;
            RawKind = (int) printerConfig.rawKind;
            Width = (int) printerConfig.width;
            Height = (int) printerConfig.height;
            ResX = (int) printerConfig.x;
            ResY = (int) printerConfig.y;
            SourceName = (string) printerConfig.sourceName;
            Duplex = (bool) printerConfig.duplex;
        }

        public (int, int) PaperSize() => (Width, Height);

        public bool IsRollPaper() => Kind.Contains("Roll");

        public bool IsPreCutPaper() => Kind.Contains("PreCut");
    }

    public class FormatConfig
    {
        public string Name;
        public int Width;
        public int Height;
        public bool Duplex;
        public bool KeepDimensions;
        public bool CutMarks;
        public PreCutInfo PreCutInfo;

        public FormatConfig(dynamic formatConfig)
        {
            Name = (string) formatConfig.name;
            Width = Helpers.Mm_To_100th_Of_Inch((int) formatConfig.width);
            Height = Helpers.Mm_To_100th_Of_Inch((int) formatConfig.height);
            Duplex = (bool) formatConfig.duplex;
            KeepDimensions = (bool) formatConfig.keepDimensions;
            CutMarks = (bool) formatConfig.cutMarks;
            PreCutInfo = new PreCutInfo(formatConfig.preCutPaperInfo);
        }

        public (int, int) FormatSize() => (Width, Height);

        public void UpdateFormatSize(int width, int height)
        {
            Width = width;
            Height = height;
        }
    }

    public class PosterConfig
    {
        public string Id;
        public string Svg;
        public string PaperColor;
        public int Copies;
        public bool MatchOrientation;

        public PosterConfig(dynamic posterConfig)
        {
            Id = (string) posterConfig.id;
            Svg = (string) posterConfig.svg;
            PaperColor = (string) posterConfig.paperColor;
            Copies = (int) posterConfig.copies;
            MatchOrientation = (bool) posterConfig.matchOrientation;
        }
    }

    public class PreCutInfo
    {
        public int MarginX;
        public int MarginY;
        public int GapX;
        public int GapY;
        public string Shape;

        public PreCutInfo(dynamic preCutInfo)
        {
            MarginX = Helpers._10th_Of_Mm_To_100th_Of_Inch((int) preCutInfo.marginX);
            MarginY = Helpers._10th_Of_Mm_To_100th_Of_Inch((int) preCutInfo.marginY);
            GapX = Helpers._10th_Of_Mm_To_100th_Of_Inch((int) preCutInfo.gapX);
            GapY = Helpers._10th_Of_Mm_To_100th_Of_Inch((int) preCutInfo.gapY);
            Shape = (string) preCutInfo.shape;
        }
    }

    public class CountInfo
    {
        public int CountPerWidth;
        public int CountPerHeight;
        public int CountPerPaper;

        public CountInfo(int countPerWidth, int countPerHeight, int countPerPaper)
        {
            CountPerWidth = countPerWidth;
            CountPerHeight = countPerHeight;
            CountPerPaper = countPerPaper;
        }
    }

    public class PaperInfo
    {
        public int PostersPerPaper;
        public int PostersPerWidth;
        public int PostersPerHeight;
        public DuplexMode DuplexMode;
    }
    
    /*
        Duplex Cases:
        -------------
            1) No Duplex:
            -------------
                a) No Rotation (shape: ↑) => no rotation
                b) Rotation (shape: ->) => rotate 90 degree
            
            2) Side-by-Side:
            ----------------
                a) No Rotation (shape: ↑.↑) => duplex double poster size = (w = 2 * width, h = height)
                b) Rotation (shape: ->.<-) => duplex double poster size = (w = 2 * height, h = width) 
            
            3) Top-Bottom:
            --------------
                a) No Rotation (shape: ⇅) => duplex double poster size = (w = width, h = 2 * height)
                b) Rotation (shape: ⇉) => duplex double poster size = (w = height, h = 2 * width)
    */

    public class DuplexMode
    {
        public int Angle1;
        public int Angle2;
        public int MismatchAngle1;
        public int MismatchAngle2;
        public int WidthFactor;
        public int HeightFactor;
        public bool IsRotated;
        public bool IsDuplex;

        public (int, int) GetRotationAngles(bool orientation_match)
        {
            if (!IsDuplex) return orientation_match ? (Angle1, 0) : (MismatchAngle1, 0);
            return orientation_match ?  (Angle1, Angle2) : (MismatchAngle1, MismatchAngle2);
        }

        public (int, int) GetUpdatedPosterSize(int posterWidth, int posterHeight, bool orientation_match = true)
        {
            var (w, h) = IsRotated && orientation_match ? (posterHeight, posterWidth) : (posterWidth, posterHeight);
            return (w * WidthFactor, h * HeightFactor);
        }
    }

    public class NoneDuplex : DuplexMode
    {
        public NoneDuplex()
        {
            Angle1 = 0;
            Angle2 = 0;
            MismatchAngle1 = 90;
            MismatchAngle2 = 0;
            WidthFactor = 1;
            HeightFactor = 1;
            IsRotated = false;
            IsDuplex = false;
        }
    }

    public class RotatedNoneDuplex : DuplexMode
    {
        public RotatedNoneDuplex()
        {
            Angle1 = 90;
            Angle2 = 0;
            MismatchAngle1 = 0;
            MismatchAngle2 = 0;
            WidthFactor = 1;
            HeightFactor = 1;
            IsRotated = true;
            IsDuplex = false;
        }
    }

    public class SideBySideDuplex : DuplexMode
    {
        public SideBySideDuplex()
        {
            Angle1 = 0;
            Angle2 = 0;
            MismatchAngle1 = 90;
            MismatchAngle2 = -90;
            WidthFactor = 2;
            HeightFactor = 1;
            IsRotated = false;
            IsDuplex = true;
        }
    }

    public class RotatedSideBySideDuplex : DuplexMode
    {
        public RotatedSideBySideDuplex()
        {
            Angle1 = 90;
            Angle2 = -90;
            MismatchAngle1 = 0;
            MismatchAngle2 = 0;
            WidthFactor = 2;
            HeightFactor = 1;
            IsRotated = true;
            IsDuplex = true;
        }
    }

    public class TopBottomDuplex : DuplexMode
    {
        public TopBottomDuplex()
        {
            Angle1 = 180;
            Angle2 = 0;
            MismatchAngle1 = 90;
            MismatchAngle2 = 90;
            WidthFactor = 1;
            HeightFactor = 2;
            IsRotated = false;
            IsDuplex = true;
        }
    }

    public class RotatedTopBottomDuplex : DuplexMode
    {
        public RotatedTopBottomDuplex()
        {
            Angle1 = 90;
            Angle2 = 90;
            MismatchAngle1 = 180;
            MismatchAngle2 = 0;
            WidthFactor = 1;
            HeightFactor = 2;
            IsRotated = true;
            IsDuplex = true;
        }
    }
}