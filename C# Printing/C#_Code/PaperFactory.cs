namespace Printing
{
    public static class PaperFactory
    {
        public static Paper NewPaper(PrintingConfig printingConfig)
        {
            if (printingConfig.IsRollPaper())
                return new RollPaper(printingConfig);

            if (printingConfig.IsPreCutPaper())
                return new PreCutPaper(printingConfig);

            return new Paper(printingConfig);
        }
    }
}