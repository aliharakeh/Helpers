using System;
using System.Globalization;
using System.IO;
using System.Text;

namespace Printing
{
    public class Logging
    {
        private const string LOG_FILE = "printingLogs.txt";
        public static int LOG_LEVEL = 5;
        private static readonly StringBuilder StringBuilder = new StringBuilder();

        private static string GetTime()
        {
            return DateTime.Now.ToString(CultureInfo.CurrentCulture);
        }

        private static void Log(string type, int level, dynamic message)
        {
            if (LOG_LEVEL < level) return;
            StringBuilder.Append($">_[{type} - {GetTime()}]::::{Helpers.ToJson(message, true)}\n");
        }

        public static void SaveLog(bool end = false)
        {
            StringBuilder.Append("".PadRight(100, '*') + "\n");
            File.AppendAllText(LOG_FILE, StringBuilder.ToString(), Encoding.UTF8);
            StringBuilder.Clear();
        }

        public static void Debug(dynamic message)
        {
            Console.WriteLine(Helpers.ToJson(message, true));
        }

        public static void Info(dynamic message)
        {
            Log("INFO", 1, message);
        }

        public static void Warning(dynamic message)
        {
            Log("WARNING", 2, message);
        }

        public static void Error(dynamic message)
        {
            Log("ERROR", 3, message);
        }
    }
}