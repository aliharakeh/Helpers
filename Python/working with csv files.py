"""
    Using CSV (Comma Separated Values) to save data
    A CSV file is an excel csv file (.csv) that is cosidered a plain text file containing data separeted by commas.
"""
import csv

# open the csv file, we spcify the newline to make it work
# on all systems
file = open("csv_data.csv", newline='')

# get the csv reader
reader = csv.reader(file)

# reader header (1st row) 
# header = next(reader)

# read data and put them in a list (all data are strings)
# data = [row for row in reader]

# print(header)
# print(data)

# a better way to get data (specifying each data type)
data = []
for row in reader:
    name = row[0]
    number = int(row[1])
    data.append([name, number])

print(data)
file.close()

# store data in a csv file
file = open("myCSV.csv", 'w', newline='')
writer = csv.writer(file)
writer.writerow(["Name", "Number"])

for e in data:
    writer.writerow([e[0], e[1]])

file.close()


