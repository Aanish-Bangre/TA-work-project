import pandas as pd
from dbfread import DBF

# Read DBF file
table = DBF('BMS6T.DBF')
df = pd.DataFrame(iter(table))

# Display the data
print("Data from BMS6T.DBF:")
print(df.head())
print("\nShape:", df.shape)
print("\nColumns:", df.columns.tolist())

# Export to CSV
csv_filename = 'BMS6T.csv'
df.to_csv(csv_filename, index=False)
print(f"\n✓ Successfully exported to {csv_filename}")

# Export to Excel
xlsx_filename = 'BMS6T.xlsx'
df.to_excel(xlsx_filename, index=False, engine='openpyxl')
print(f"✓ Successfully exported to {xlsx_filename}")