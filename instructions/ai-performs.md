**1. Prompt Techniques**

The core idea here is that how you phrase your requests ("prompts") to the AI significantly impacts the quality of the code it generates. Vague or overly complex prompts lead to poor results. Here's a breakdown of the specific techniques mentioned:

- **"The fewer lines of code, the better"**:

  - **Explanation:** AI models often try to be overly helpful, producing verbose and complex code. Explicitly telling it to be concise encourages simpler, more maintainable code.
  - **Example:** Instead of:
    ```
    "Write a function that checks a list for even numbers."
    ```
    Try:
    ```
    "Write a concise function that checks a list for even numbers. The fewer lines of code, the better."
    ```

- **"Proceed like a Senior Developer // 10x engineer"**:

  - **Explanation:** This sets a persona for the AI. It encourages the model to use best practices, consider edge cases, and produce higher-quality code than if you just asked for a basic function.
  - **Example:**
    ```
    "Proceed like a Senior Developer. Write a function in Python that takes a list of strings and returns a new list containing only the strings that are palindromes."
    ```

- **"DO NOT STOP WORKING until..." (with a specific condition)**:

  - **Explanation:** This combats the AI's tendency to be "lazy" or stop before fully completing a complex task. It provides a clear stopping point.
  - **Example:**
    ```
    "Refactor this class to use dependency injection. DO NOT STOP WORKING until all dependencies are injected through the constructor."
    ```

- **"Reasoning paragraphs"**:
  - **Explanation:** This is a core prompt engineering technique called "Chain-of-Thought" prompting. It forces the AI to explain its reasoning _before_ writing the code. This dramatically improves accuracy and helps you understand _why_ the AI made the choices it did.
  - **Example:**
    ```
    "We have an error in the authentication flow. Start by writing 3 reasoning paragraphs analyzing what the error might be. DO NOT JUMP TO CONCLUSIONS. After that, provide the corrected code."
    ```
- **"Answer in short"**:
  Make sure that it give you the answer as short as possible and don't explain too much.

- **"Unbiased 50-50"**:

  - **Explanation** : When comparing 2 things ask the AI to explain first each one of them and then decide which one is the best.
  - **Example** :

  ```
  "BEFORE YOU ANSWER, I want you to write two detailed paragraphs, one arguing for each of these solutions- do not jump to conclusions. seriously consider both approaches

  then, after you finish, tell me whether one of these solutions is obviously better than the other, and why."
  ```

**2. Putting names of files as a comment on top of each file**

- **Explanation:** Cursor uses the file structure and names to understand the context of your code. Adding the filename as a comment (e.g., `# backend/ai_agent.py`) at the top of _every_ file reinforces this context, especially in larger projects.
- **Why it Matters:** If you have many files open, Cursor might get "confused" about which file is relevant to your current request. This helps it focus. It's especially important if you have multiple files with similar names but in different directories.
- **Example:**

  ```python
  # backend/ai_agent.py

  # ... rest of your code ...
  ```

- **Efficiency:** It helps avoid the AI making incorrect assumptions about which file you're referencing, saving you time and frustration.

**3. Avoid Huge Refactors – Do This Instead**

- **Explanation:** Asking an AI to refactor a large chunk of code in one go is risky. The AI might make unintended changes, introduce bugs, or get lost in the complexity.
- **The Better Way:**

  - **Break it down:** Decompose the refactoring task into smaller, well-defined steps.
  - **Example:** Instead of:
    ```
    "Refactor the entire user authentication system."
    ```
    Try:
    ```
    "Step 1: Refactor the `login` function in `auth.py` to use the new `User` class."
    "Step 2: Update the `register` function in `auth.py` to use the new `User` class."
    "Step 3: Refactor the database interaction in `user_db.py` to use the new `User` class."
    ```
  - **Test After Each Step:** Crucially, run tests (or manually check) _after each small change_. This isolates bugs and prevents cascading errors.

- **Efficiency:** Smaller, incremental changes are easier for the AI to handle correctly. You catch errors early, preventing massive debugging sessions later.

**4. Roadmap.md File**

- **Explanation:** Create a `roadmap.md` file (using Markdown formatting) in a known location in your project (like an "instructions" folder). This file contains:
  - **Current Status:** What are you working on _right now_?
  - **Next Steps:** What are the immediate priorities?
  - **Future Plans:** Longer-term goals and features. This is where you "dump" your ideas, even if they are not fully formed.
  - **Key Files and Folders:** Can refer other files and folders, like instructions, Supabase, front end, backend, etc.
- **Why it Matters:** This gives the AI a high-level overview of your project's state and goals. It doesn't need to understand all the code, but it needs to know _your_ intentions.
- **Example:**

  ```markdown
  # roadmap.md

  ## Current Focus

  We are working on user authentication using both Anthropic and OpenAI APIs.

  ## Next Steps

  - Finish implementing Supabase database integration.
  - Create documentation for database structure.
  - Prepare to store AI agent outputs.

  ## Future

  - Add new V0 features (see the V0, lovable, bolt...file)
  - Improve debugging process...
  ```

- **Efficiency:** Provides context for the AI, so it's less likely to get sidetracked. It also keeps _you_ organized!

**5. Model Knowledge Cutoff… CHECK DOCS!**

- **Explanation:** AI models (like Claude 3.5 Sonnet used in Cursor) have a "knowledge cutoff" date. They don't know about anything that happened _after_ that date. This is especially critical for:
  - **New Libraries/Frameworks:** If a library was released or significantly updated _after_ the cutoff date, the AI will have outdated or incorrect information.
  - **Breaking Changes:** Libraries often have breaking changes between versions. The AI might suggest code that worked in an older version but doesn't work now.
- **The Solution:** _Always_ check the official documentation for the tools and libraries you are using.
- **Example:**
  If you are working with a new JavaScript framework that was released last month, the AI probably won't know about it. You need to consult the framework's documentation yourself.
- Always ask the model what it’s knowledge cutoff is.

**6. Have the AI Tell You What to Do – Debugging**

- **Explanation:** Don't just throw an error at the AI and expect it to magically fix it. Instead, ask the AI for a _debugging strategy_. This leverages the AI's strengths (problem analysis) and your strengths (hands-on debugging).
- **Example Prompt:**
  ```
  "I'm getting a `TypeError: 'NoneType' object is not iterable` in `my_function.py` on line 42.  I'm using Python 3.9 and the `requests` library.  What steps should I take to debug this?  Give me specific instructions I can follow."
  ```
- **Efficiency:** The AI can often suggest debugging steps you might not have thought of, like using specific debugger commands, inspecting certain variables, or adding logging statements.

**7. How to Add New Features – The MVP Approach**

- **Explanation:** MVP = Minimum Viable Product. Focus on building the _smallest_ possible version of a feature that still delivers value.
- **Why it's Crucial with AI:**
  - **Avoids Over-Engineering:** It's easy to get carried away with "cool" features when using AI, but many of them aren't actually necessary.
  - **Faster Iteration:** Small, focused changes are easier to build, test, and refine.
  - **Reduced Technical Debt:** Less chance of accumulating a lot of messy, untested code.
- **The Process:**
  1.  **Brainstorm:** List _all_ the features you _might_ want.
  2.  **Prioritize:** Identify the _core_ feature that solves the most fundamental problem.
  3.  **MVP Definition:** What's the absolute minimum set of functionality needed to deliver that core value?
  4.  **Build and Test:** Focus only on the MVP, and test it thoroughly.
  5.  **Iterate:** _Then_ add more features, one at a time.
- **Example:** Instead of "Build a full user authentication system with email, social login, password reset, etc.", start with "Implement basic username/password login and registration."

**8. DO NOT LET AI MAKE BIG DECISIONS**

- **Explanation:** AI is a powerful tool, but it's still just a tool. You are the human in charge. Don't blindly follow its suggestions.
- **Examples of Big Decisions:**
  - **Overall Project Architecture:** The AI might suggest a framework or database structure, but you need to make the final call based on your needs and expertise.
  - **Major Refactors:** Don't let the AI do massive code changes without understanding the implications.
  - **Deleting or Ignoring Code:** Be very careful about deleting code based solely on the AI's suggestion.
  - **Business Logic:** The AI can help you _implement_ features, but it shouldn't decide _what_ features to build.
- **Efficiency:** Trusting the AI _too much_ can lead to wasted effort and bad outcomes. You are ultimately responsible for the project.

In essence, use the AI as a powerful assistant, but always be the one in control, making the key decisions and guiding the development process.
