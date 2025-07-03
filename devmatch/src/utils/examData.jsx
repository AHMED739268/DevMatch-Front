// Exam questions for Computer Science basics
export const EXAM_QUESTIONS = [
  {
    question: "What is encapsulation in OOP?",
    options: [
      "Binding data and methods that operate on that data within one unit",
      "Ability of different objects to respond to the same function call",
      "Deriving new classes from existing ones",
      "Breaking a program into functions"
    ],
    answer: 0
  },
  {
    question: "Which data structure uses FIFO order?",
    options: [
      "Stack",
      "Queue",
      "Tree",
      "Graph"
    ],
    answer: 1
  },
  {
    question: "Which of the following is NOT an operating system?",
    options: [
      "Linux",
      "Windows",
      "Oracle",
      "macOS"
    ],
    answer: 2
  },
  {
    question: "What is the time complexity of binary search?",
    options: [
      "O(n)",
      "O(log n)",
      "O(n^2)",
      "O(1)"
    ],
    answer: 1
  },
  {
    question: "Which concept allows using the same function name for different types?",
    options: [
      "Inheritance",
      "Polymorphism",
      "Abstraction",
      "Encapsulation"
    ],
    answer: 1
  },
  {
    question: "Which of the following is a linear data structure?",
    options: [
      "Tree",
      "Graph",
      "Array",
      "Hash Table"
    ],
    answer: 2
  },
  {
    question: "Which OS component manages memory?",
    options: [
      "Compiler",
      "Loader",
      "Memory Manager",
      "Assembler"
    ],
    answer: 2
  },
  {
    question: "What is the main advantage of linked lists over arrays?",
    options: [
      "Faster access time",
      "Dynamic size",
      "Less memory usage",
      "Simpler implementation"
    ],
    answer: 1
  },
  {
    question: "Which of the following is not a feature of OOP?",
    options: [
      "Encapsulation",
      "Polymorphism",
      "Recursion",
      "Inheritance"
    ],
    answer: 2
  },
  {
    question: "Which data structure is used for function call management?",
    options: [
      "Queue",
      "Stack",
      "Array",
      "Linked List"
    ],
    answer: 1
  }
];

export function getRandomQuestions(count = 5) {
  // Shuffle and pick 'count' questions
  const shuffled = EXAM_QUESTIONS.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
} 