// cSpell:disable

Data generation for the Yeko app.

## Generate a school

```json
{
  code: "123456JV",
  cycleId: "kd7ev4de9vby1tfr9avq46rvb9765bjz",
  email: "julesverne@edu.com",
  imageUrl:
    "https://merry-rook-953.convex.cloud/api/storage/1f9caac3-5f42-4d94-b0c4-95e96a2b23a7",
  isTechnicalEducation: false,
  name: "Jules Verne",
  phone: "0707000000",
  stateId: "kn7cyeq1h4j7dm9rnkqpf7ervh76410b",
}
```

## Generate a school member

```json
{
  roleId: "jx7fcx8g6jb1zfkj9jtg03bk9h76dymw",
  schoolId: "kh77tq1ybcnxmpre33fmwqwa4s765kqb",
  userId: "k97dvyz7gxhn1pxyqgszh1za59765b1g",
}
```


## Generate random classes for a given set of schoolIds and gradeIds.

```typescript
interface Grade {
  _creationTime: number;
  _id: string;
  cycleId: string;
  description: string;
  name: string;
}

interface GradeData {
  gradeNames: Record<string, string>;
  gradeSeries: Record<string, string[]>;
}

/**
 * Extracts grade names and series information from a list of Grade objects.
 *
 * @param grades - An array of Grade objects.
 * @returns An object containing two properties:
 *   - gradeNames: A dictionary mapping grade IDs to grade names.
 *   - gradeSeries: A dictionary mapping grade IDs to arrays of series letters (if applicable).
 */
function extractGradeData(grades: Grade[]): GradeData {
  const gradeNames: Record<string, string> = {};
  const gradeSeries: Record<string, string[]> = {};

  for (const grade of grades) {
    gradeNames[grade._id] = grade.name;

    // Use a more robust method to identify grades with series
    if (grade.name.startsWith("2nd")) {
      gradeSeries[grade._id] = ["A", "C"];
    } else if (grade.name.startsWith("1ère") || grade.name.startsWith("Tle")) {
      gradeSeries[grade._id] = ["A", "C", "D"];
    }
    // Potential improvement: Add a field to the Grade interface to explicitly indicate series, e.g.,
    // gradeSeries[grade._id] = grade.series || []; 
  }

  return { gradeNames, gradeSeries };
}

/**
 * Generates random classes for a given set of school IDs and grade IDs.
 *
 * @param schoolIds - An array of school IDs.
 * @param gradeIds - An array of grade IDs.
 * @param gradesData -  Extracted grade names and series data using 'extractGradeData' function
 * @returns An array of class objects, each with gradeId, name, and schoolId properties.
 */
function generateClasses(schoolIds: string[], gradeIds: string[], gradesData: GradeData): any[] {
  const classes = [];
  const { gradeNames, gradeSeries } = gradesData;

  for (const schoolId of schoolIds) {
    for (const gradeId of gradeIds) {
      // Generate a random number of classes between 3 and 15 (inclusive).
      const numClasses = Math.floor(Math.random() * 13) + 3;
      const series = gradeSeries[gradeId] || [];
      const gradeName = gradeNames[gradeId] || "Unknown Grade";

      for (let i = 1; i <= numClasses; i++) {
        let className = gradeName + " ";

        if (series.length > 0) {
          // Use series letters for class names
          const seriesIndex = (i - 1) % series.length;
          const seriesLetter = series[seriesIndex];
          const classNumber = Math.floor((i - 1) / series.length) + 1;
          className += seriesLetter + classNumber;
        } else {
          // Use sequential numbers for class names, with letter prefixes for numbers > 15.
          className += i > 15 ? String.fromCharCode(65 + (i - 16)) + (i > 31 ? i - 16 : "") : i;
        }

        classes.push({
          gradeId: gradeId,
          name: className,
          schoolId: schoolId,
        });
      }
    }
  }

  return classes;
}

// Example usage:
const schoolIds = [];
const gradeIds = [];

// You would typically fetch the gradesData from an API or a database
const gradesData = [
  // ... (Your grades data from the previous example) ...
];

const extractedGradesData = extractGradeData(gradesData);
const generatedClasses = generateClasses(schoolIds, gradeIds, extractedGradesData);
console.log(JSON.stringify(generatedClasses, null, 2));
```
