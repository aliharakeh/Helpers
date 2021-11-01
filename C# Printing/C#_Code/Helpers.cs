using System;
using System.Collections.Generic;
using System.Drawing.Printing;
using System.Runtime.InteropServices;
using System.IO;
using Newtonsoft.Json;


namespace Printing
{
    public static class Helpers
    {
        public const double CONVERTUNIT_MM_TO_100TH_OF_INCH = 100 / 25.4;
        public const double CONVERTUNIT_100TH_OF_INCH_TO_MM = 25.4 / 100;
        public const int CONVERTUNIT_MM_TO_10TH_OF_MM = 10;

        public static PrinterSettings GetPrinterSettings(string printerName)
        {
            var ps = new PrinterSettings
            {
                PrinterName = printerName
            };
            return ps;
        }

        public static List<string> ToList(dynamic collection)
        {
            var result = new List<string>();
            foreach (var item in collection)
            {
                result.Add(item.ToString());
            }

            return result;
        }

        public static Dictionary<string, dynamic> GetPropertyDict(dynamic item, List<string> properties)
        {
            var result = new Dictionary<string, dynamic>();
            foreach (var property in properties)
            {
                var propertyInfo = item.GetType().GetProperty(property);
                var value = propertyInfo.GetValue(item, null);
                result.Add(property, value);
            }

            return result;
        }

        public static List<Dictionary<string, dynamic>> GetPropertiesList(dynamic collection, List<string> properties)
        {
            var data = new List<Dictionary<string, dynamic>>();
            foreach (var item in collection)
            {
                data.Add(GetPropertyDict(item, properties));
            }

            return data;
        }

        public static string ToJson(dynamic obj, bool indent = false)
        {
            return JsonConvert.SerializeObject(obj, indent ? Formatting.Indented : Formatting.None);
        }

        public static dynamic ToObject(string json)
        {
            return JsonConvert.DeserializeObject(json);
        }

        public static byte[] MemoryToBuffer(IntPtr unmanagedData, int size)
        {
            var buffer = new byte[size];
            Marshal.Copy(unmanagedData, buffer, 0x0, buffer.Length);
            return buffer;
        }

        public static IntPtr BufferToMemory(byte[] managedData)
        {
            var userConfig = Marshal.AllocHGlobal(managedData.Length);
            Marshal.Copy(managedData, 0, userConfig, managedData.Length);
            return userConfig;
        }

        public static void FreeMemory(IntPtr unmanagedMemoryPointer)
        {
            if (unmanagedMemoryPointer != IntPtr.Zero)
                Marshal.FreeHGlobal(unmanagedMemoryPointer);
        }

        public static void SaveConfig(string configPath, IntPtr userConfig, int size)
        {
            if (!File.Exists(configPath))
            {
                var parent = Directory.GetParent(configPath).FullName;
                Directory.CreateDirectory(parent);
            }

            var fs = new FileStream(configPath, FileMode.Create, FileAccess.Write, FileShare.None);
            var buffer = MemoryToBuffer(userConfig, size);
            fs.Write(buffer, 0, size);
            fs.Close();
        }

        public static IntPtr LoadConfig(string configPath)
        {
            if (!File.Exists(configPath)) return IntPtr.Zero;

            var fs = new FileStream(configPath, FileMode.Open, FileAccess.Read);
            var buffer = new byte[fs.Length];
            fs.Read(buffer, 0, buffer.Length);
            var userConfig = BufferToMemory(buffer);
            fs.Close();
            return userConfig;
        }

        public static int Mm_To_100th_Of_Inch(int mm)
        {
            return (int) Math.Round(mm * CONVERTUNIT_MM_TO_100TH_OF_INCH);
        }

        public static int _100th_Of_Inch_To_Mm(int _100thOfInch)
        {
            return (int) Math.Round(_100thOfInch * CONVERTUNIT_100TH_OF_INCH_TO_MM);
        }

        public static int _100th_Of_Inch_To_10th_Of_Mm(int _100thOfInch)
        {
            return _100th_Of_Inch_To_Mm(_100thOfInch) * CONVERTUNIT_MM_TO_10TH_OF_MM;
        }

        public static int _10th_Of_Mm_To_100th_Of_Inch(int _10thOfMm)
        {
            return Mm_To_100th_Of_Inch(_10thOfMm / CONVERTUNIT_MM_TO_10TH_OF_MM);
        }
        
        public static int _100th_Of_Inches_To_Pixels(int ppi, int _100thOfInch)
        {
            var inches = _100thOfInch / 100;
            return (int) Math.Round(inches * 1.0 / ppi);
        }
    }
}