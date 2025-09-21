const prompt = `Generate 3 visual assessment questions for a child aged ${age}
  in grade ${grade}. The questions should be based on the following
  subjects: ${subjects.join(", ")}. Each question should involve matching
  an image to one of three options. Provide the output as a JSON array of
  objects, where each object has 'questionText', 'questionShape', 'subject', and 'options'
  (an array of objects with 'shape' and 'isCorrect' properties). The
  'questionShape'and 'options.shape' should be valid placeholder image URLs
  from'https://placehold.co/100x100?text=...' with a descriptive text for the
  image.For example, if the image is of a cat, the URL should be
  'https://placehold.co/100x100?text=Cat'.Example:
  [{"questionText":"Match the image!","questionShape":
  "https://placehold.co/100x100?text=QuestionImage",
  "subject":"animals",
  "options":[{"shape":"https://placehold.co/100x100?text=Option1","isCorrect":true},
  {"shape":"https://placehold.co/100x100?text=Option2","isCorrect":false},
  {"shape":"https://placehold.co/100x100?text=Option3","isCorrect":false}]}]
`;
