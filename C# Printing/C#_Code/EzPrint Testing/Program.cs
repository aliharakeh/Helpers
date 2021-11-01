using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using Printing;

namespace EzPrint
{
    internal class Program
    {
        private static void TestPrinting(List<PrintingConfig> printingConfigs)
        {
            var successful = new List<PrintingConfig>();
            var failed = new List<PrintingConfig>();

            foreach (var printingConfig in printingConfigs)
            {
                Logging.Info(printingConfig.PrinterConfig.ToString());
                Logging.Info(printingConfig.PrinterConfig.ToString());

                try
                {
                    DirectPrint directPrint = new DirectPrint(printingConfig);
                    var printed = directPrint.Print();
                    if (printed) successful.Add(printingConfig);
                    else failed.Add(printingConfig);
                }
                catch (Exception ex)
                {
                    failed.Add(printingConfig);
                    Logging.Error(ex.Message);
                }

                Thread.Sleep(2000);
            }

            Logging.Info($"Successful PrintingConfigs: {successful.Count}");
            Logging.Info($"Failed PrintingConfigs: {failed.Count}");
        }

        public static void Main(string[] args)
        {
            Console.WriteLine(">_ Please Check if the below files exists before proceeding");

            var neededPosteres = new HashSet<string>();
            foreach (var test in Tests.PrintingTests)
            {
                neededPosteres.Add($"{test.PosterConfig.PaperName}_poster.svg");
            }

            foreach (var poster in neededPosteres)
            {
                Console.WriteLine($">_ \"{poster}\"");
            }

            Console.WriteLine(">_ Press any key to continue...");
            var input = Console.ReadLine();

            foreach (var test in Tests.PrintingTests)
            {
                test.PosterConfig.SvgString = File.ReadAllText($"{test.PosterConfig.PaperName}_poster.svg");
            }

            TestPrinting(Tests.PrintingTests);
        }
    }
}
