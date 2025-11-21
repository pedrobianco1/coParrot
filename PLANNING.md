
# 🚀 Implementation Plan  

## 📝 Overview  
- **Feature / Fix:** CoParrot
- **Date:** 2025-11-21  
- **Status:** In Progress  
- **Priority:** High  

---

## 🎯 Goals  
- **Problem:** Be able to generate commit messages, branch names and PR messages fast and realiable with AI.  
- **Importance:** Will save me time  
- **Expected Outcome:** Finish fast to be able to publish the package on NPM  

---

## 📋 Tasks  
- [x] `/status` see current repo status with changed files 
- [x] `/add` be able to browse between files and stage or unstage them 
- [ ] `/commit` be able to commit the added files (run /commit {optional file} -> AI generates the message -> prompt if the user approves -> commit)
- [ ] `/checkout` be able to create a new branch with AI (options: give context, based on changes, )
- [ ] `/auto` be able to automaticly add and generate the commit message for each file and commit them

#### /checkout

I want to be able to automate the branch creation process so when I run /checkout it should:

git pull (current branch) -> git checkout -b {generated_name}

*Available options*

the options to create a new branch will be:

- Provide context (describe what you have done);
- Based on changes (AI generates only with the context from the changes files);

---

## 🔧 Technical Notes  
- **Stack:** Rails (API), React (widget frontend)  
- **Related Files:**  
  - `app/controllers/whatsapp/messages_controller.rb`  
  - `app/controllers/webchat/messages_controller.rb` (new)  
  - `config/routes.rb`  
- **Reference Method:**  
  ```rb
  def create_message(user_id, content, channel: :whatsapp)
