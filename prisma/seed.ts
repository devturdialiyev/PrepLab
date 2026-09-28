import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Dual-Track IELTS & SAT Educational Platform...");

  // Clear existing data
  await prisma.submissionEvaluation.deleteMany({});
  await prisma.studentAnswer.deleteMany({});
  await prisma.examSubmission.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.examSection.deleteMany({});
  await prisma.mockExam.deleteMany({});
  await prisma.studyMaterial.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.user.deleteMany({});

  const defaultPasswordHash = await bcrypt.hash("Password123!", 10);

  // 1. Create Users (8 Target Personas across 4 Tiers)
  console.log("Creating user personas...");

  const superAdmin = await prisma.user.create({
    data: {
      email: "superadmin@edu.com",
      name: "Dr. Alexander Cross",
      passwordHash: defaultPasswordHash,
      role: "SUPER_ADMIN",
      trackAccess: "BOTH",
      targetScore: null,
    },
  });

  const ieltsAdmin = await prisma.user.create({
    data: {
      email: "ielts.admin@edu.com",
      name: "Eleanor Vance (IELTS Director)",
      passwordHash: defaultPasswordHash,
      role: "TRACK_ADMIN",
      trackAccess: "IELTS",
    },
  });

  const satAdmin = await prisma.user.create({
    data: {
      email: "sat.admin@edu.com",
      name: "Marcus Holloway (SAT Dean)",
      passwordHash: defaultPasswordHash,
      role: "TRACK_ADMIN",
      trackAccess: "SAT",
    },
  });

  const ieltsTeacher = await prisma.user.create({
    data: {
      email: "ielts.teacher@edu.com",
      name: "Sarah Jenkins (Examiner)",
      passwordHash: defaultPasswordHash,
      role: "TEACHER",
      trackAccess: "IELTS",
    },
  });

  const satTeacher = await prisma.user.create({
    data: {
      email: "sat.teacher@edu.com",
      name: "David Chen (Math & RW Master)",
      passwordHash: defaultPasswordHash,
      role: "TEACHER",
      trackAccess: "SAT",
    },
  });

  const dualTeacher = await prisma.user.create({
    data: {
      email: "dual.teacher@edu.com",
      name: "Prof. Rachel Green (Dual Instructor)",
      passwordHash: defaultPasswordHash,
      role: "TEACHER",
      trackAccess: "BOTH",
    },
  });

  const ieltsStudent = await prisma.user.create({
    data: {
      email: "ielts.student@edu.com",
      name: "Amina Al-Mansoor",
      passwordHash: defaultPasswordHash,
      role: "STUDENT",
      trackAccess: "IELTS",
      targetScore: "Band 8.0",
    },
  });

  const satStudent = await prisma.user.create({
    data: {
      email: "sat.student@edu.com",
      name: "Liam O'Connor",
      passwordHash: defaultPasswordHash,
      role: "STUDENT",
      trackAccess: "SAT",
      targetScore: "1550",
    },
  });

  const dualStudent = await prisma.user.create({
    data: {
      email: "dual.student@edu.com",
      name: "Sofia Rodriguez",
      passwordHash: defaultPasswordHash,
      role: "STUDENT",
      trackAccess: "BOTH",
      targetScore: "Band 7.5 & 1500",
    },
  });

  // Enrollments
  await prisma.enrollment.createMany({
    data: [
      { userId: ieltsStudent.id, track: "IELTS", status: "ACTIVE" },
      { userId: satStudent.id, track: "SAT", status: "ACTIVE" },
      { userId: dualStudent.id, track: "IELTS", status: "ACTIVE" },
      { userId: dualStudent.id, track: "SAT", status: "ACTIVE" },
    ],
  });

  // 2. Study Materials
  console.log("Seeding study materials...");
  await prisma.studyMaterial.createMany({
    data: [
      {
        title: "IELTS Academic Writing Task 2 Master Guide",
        description: "Band 9 essay structures, vocabulary, and cohesion masterclass.",
        track: "IELTS",
        module: "WRITING",
        fileUrl: "/materials/ielts-writing-task2-guide.pdf",
        fileType: "PDF",
        fileSize: "3.4 MB",
        uploadedById: ieltsTeacher.id,
      },
      {
        title: "IELTS Listening Practice Audio Track - Section 1-4",
        description: "Official accents (British, Australian, American) with test sheets.",
        track: "IELTS",
        module: "LISTENING",
        fileUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        fileType: "AUDIO",
        fileSize: "12.1 MB",
        uploadedById: ieltsTeacher.id,
      },
      {
        title: "SAT Advanced Math: Quadratics, Functions & Trigonometry",
        description: "Official Digital SAT hard question compilation with step-by-step solutions.",
        track: "SAT",
        module: "MATH",
        fileUrl: "/materials/sat-advanced-math.pdf",
        fileType: "PDF",
        fileSize: "5.8 MB",
        uploadedById: satTeacher.id,
      },
      {
        title: "SAT Reading & Writing: Craft, Structure & Synthesis",
        description: "In-depth guide for rhetorical synthesis and standard English conventions.",
        track: "SAT",
        module: "READING_WRITING",
        fileUrl: "/materials/sat-rw-strategies.pdf",
        fileType: "PDF",
        fileSize: "4.1 MB",
        uploadedById: satTeacher.id,
      },
    ],
  });

  // 3. Courses & Lessons
  console.log("Seeding courses and lessons...");
  const ieltsCourse = await prisma.course.create({
    data: {
      title: "IELTS Academic Band 8+ Complete Accelerator",
      description: "Master all 4 skills: Listening, Reading, Writing, and Speaking.",
      track: "IELTS",
      level: "ADVANCED",
      lessons: {
        create: [
          {
            title: "Overcoming IELTS Reading Passage 3 Pitfalls",
            module: "READING",
            order: 1,
            duration: 25,
            content: "Learn how to tackle complex scientific and sociological texts with speed skimming and keyword mapping.",
          },
          {
            title: "Task 2 Discursive Essay Frameworks",
            module: "WRITING",
            order: 2,
            duration: 35,
            content: "Structuring agree/disagree vs discuss both views essays with clear thesis statements.",
          },
        ],
      },
    },
  });

  const satCourse = await prisma.course.create({
    data: {
      title: "Digital SAT 1500+ High-Scorer Bootcamp",
      description: "Adaptive testing tactics, Desmos calculator hacks, and tricky grammar rules.",
      track: "SAT",
      level: "ADVANCED",
      lessons: {
        create: [
          {
            title: "Desmos Graphing Hacks for SAT Math",
            module: "MATH",
            order: 1,
            duration: 30,
            content: "Solve systems of nonlinear equations and regressions in under 20 seconds.",
          },
          {
            title: "Mastering Punctuation & Rhetorical Synthesis",
            module: "READING_WRITING",
            order: 2,
            duration: 20,
            content: "Semicolons, colons, dashes, and bullet-point notes synthesis questions.",
          },
        ],
      },
    },
  });

  // 4. IELTS Mock Exam
  console.log("Seeding IELTS Mock Exam...");
  const ieltsMock = await prisma.mockExam.create({
    data: {
      title: "IELTS Academic Full Mock Exam 01",
      description: "Comprehensive 4-module test with official band scoring criteria.",
      track: "IELTS",
      examType: "FULL_MOCK",
      durationMinutes: 160,
      totalQuestions: 40,
      createdById: ieltsTeacher.id,
      sections: {
        create: [
          {
            sectionType: "READING",
            title: "Academic Reading Section",
            durationMinutes: 60,
            order: 1,
            passageText: "The Migration of Marine Megafauna: Recent satellite telemetry has revolutionized our understanding of pelagic species. Biologists at the Global Marine Census observed that leatherback turtles navigate over 12,000 kilometers across the Pacific basin using geomagnetic cues.",
            questions: {
              create: [
                {
                  order: 1,
                  type: "TRUE_FALSE_NOT_GIVEN",
                  questionText: "Leatherback turtles use geomagnetic cues to navigate Pacific migrations.",
                  correctAnswer: "TRUE",
                  optionsJson: JSON.stringify(["TRUE", "FALSE", "NOT GIVEN"]),
                  explanation: "The passage explicitly states that leatherback turtles navigate using geomagnetic cues.",
                  points: 1,
                },
                {
                  order: 2,
                  type: "MULTIPLE_CHOICE",
                  questionText: "What technology revolutionized marine biologists' tracking capabilities?",
                  optionsJson: JSON.stringify([
                    "A. Sonar mapping",
                    "B. Satellite telemetry",
                    "C. Aerial drones",
                    "D. Deep-sea submersibles"
                  ]),
                  correctAnswer: "B. Satellite telemetry",
                  explanation: "The text directly credits 'satellite telemetry' for the revolution in understanding.",
                  points: 1,
                },
              ],
            },
          },
          {
            sectionType: "WRITING",
            title: "Academic Writing Task 2",
            durationMinutes: 40,
            order: 2,
            passageText: "Some people believe that university education should be completely free for everyone regardless of financial background. Others believe students should pay fees because higher education brings personal career benefits. Discuss both views and give your own opinion. Write at least 250 words.",
            questions: {
              create: [
                {
                  order: 1,
                  type: "ESSAY",
                  questionText: "Compose your essay addressing both viewpoints and stating your personal opinion.",
                  correctAnswer: null,
                  points: 9,
                },
              ],
            },
          },
        ],
      },
    },
  });

  // 5. SAT Mock Exam
  console.log("Seeding SAT Mock Exam...");
  const satMock = await prisma.mockExam.create({
    data: {
      title: "Digital SAT Practice Test #1 (Official Style)",
      description: "Timed adaptive module format with built-in calculator and formula sheets.",
      track: "SAT",
      examType: "FULL_MOCK",
      durationMinutes: 134,
      totalQuestions: 54,
      createdById: satTeacher.id,
      sections: {
        create: [
          {
            sectionType: "SAT_RW",
            title: "Reading and Writing - Module 1",
            durationMinutes: 32,
            order: 1,
            passageText: "In the late 19th century, botanist Barbara McClintock's groundbreaking research on maize genetics challenged the prevailing consensus that genomes are static. She demonstrated that genetic elements can change positions within chromosomes, a phenomenon now termed 'transposons'.",
            questions: {
              create: [
                {
                  order: 1,
                  type: "MULTIPLE_CHOICE",
                  questionText: "Which choice best describes the main idea of the passage?",
                  optionsJson: JSON.stringify([
                    "A. McClintock discovered that maize genetics strictly followed static chromosomal laws.",
                    "B. McClintock's findings overturned the belief that genomes are fixed and unalterable.",
                    "C. Late 19th-century botanists rejected genetics altogether.",
                    "D. Transposons were already well understood prior to McClintock's experiments."
                  ]),
                  correctAnswer: "B. McClintock's findings overturned the belief that genomes are fixed and unalterable.",
                  explanation: "Option B directly captures how her discovery of transposition challenged the static genome consensus.",
                  points: 1,
                },
              ],
            },
          },
          {
            sectionType: "SAT_MATH",
            title: "Math - Module 1",
            durationMinutes: 35,
            order: 2,
            passageText: "Calculator permitted. Reference formulas: Area of circle = πr², Volume of cylinder = πr²h, Pythagorean theorem: a² + b² = c².",
            questions: {
              create: [
                {
                  order: 1,
                  type: "STUDENT_PRODUCED_MATH",
                  questionText: "If 3x + 7 = 28, what is the value of 6x - 4?",
                  correctAnswer: "38",
                  explanation: "3x = 21 -> x = 7. Therefore, 6(7) - 4 = 42 - 4 = 38.",
                  points: 1,
                },
                {
                  order: 2,
                  type: "MULTIPLE_CHOICE",
                  questionText: "The function f is defined by f(x) = 2x² - 8x + 11. What is the minimum value of f(x)?",
                  optionsJson: JSON.stringify(["A. 2", "B. 3", "C. 4", "D. 11"]),
                  correctAnswer: "B. 3",
                  explanation: "Vertex x-coordinate = -b/(2a) = 8/(2*2) = 2. f(2) = 2(4) - 8(2) + 11 = 8 - 16 + 11 = 3.",
                  points: 1,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("Database seeded successfully with all 8 demo personas and mock tests!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
