import os

# Loop through all files in the current working directory
for filename in os.listdir('.'):
  # Check if the file is a PNG (using lower() to catch both .png and .PNG)
  if filename.lower().endswith('.png'):
    # Convert to lowercase and replace spaces with hyphens
    new_filename = filename.lower().replace(' ', '-')

    # Rename the file if the name has changed
    if filename != new_filename:
      os.rename(filename, new_filename)
      print(f"Renamed: '{filename}' -> '{new_filename}'")

print('\nAll PNG files have been successfully renamed!')
