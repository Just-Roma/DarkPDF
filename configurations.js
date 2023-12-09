/*
Default colors, contrasts and boundary positions. Adjust if needed.
Please notice that values are not checked. Choosing values beyond
the mentioned types/ranges might lead to unexpected results/behaviour.
*/
const DEFAULT = {
  header_color: 0,         // shall be int in   [0,  255]
  header_contrast: 50,     // shall be int in   [50, 100]
  pdf_color: 255,          // shall be int in   [0,  255]
  pdf_contrast: 100,       // shall be int in   [50, 100]
  side_color: 0,           // shall be int in   [0,  255]
  side_contrast: 50,       // shall be int in   [50, 100]
  top_boundary: '7.63%',   // shall be float in [0,   25]
  left_boundary: '27.58%', // shall be float in [0,   50]
  right_boundary: '71.28%' // shall be float in [50, 100]
};
