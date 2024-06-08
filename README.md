# CREATING connecthive DB in MySQL Workbench

-- Create the database
CREATE DATABASE IF NOT EXISTS connecthive;

-- Use the database
USE connecthive;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  age INT,
  gender VARCHAR(10),
  location VARCHAR(100),
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL -- Adjusted length to store bcrypt hashed passwords
);

-- Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  hobbies TEXT,
  personality TEXT,
  lifestyle TEXT,
  social_preferences TEXT,
  beliefs TEXT,
  goals TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, -- Ensures profiles are removed if the user is deleted
  INDEX (user_id) -- Added index for efficient lookups
);


# Key commands for test
    -node listusers.js - allows team member to view a list of registered users to test their mysql connect. For info on how to connect to your MySQL Workbench read backend README.md

    node deleteusers.js - allows team member to delete specified registered users to clean up after creating test accounts

# Testing API endpoints such as security, login, registration and profile creation with POSTMAN
    -Go to Postman API Platform create and account using any email preferred
    -Go to My Workspace select "New" and click HTTP then click the GET from down and turn it to POST for all following API testing steps
    -These are the format of the URLs, provided everything is functioning 
        - First URL is http://localhost:5000/api/register and paste into POSTMAN's "enter URL or paste text" box
            - Go to "Body" select raw and create test user registration example provided, to copy and paste, after, click "Send" and a success message should display

                 /*   {
                    "name": "Test User",
                     "age": 25,
                     "gender": "female",
                     "location": "Test City",
                     "email": "testuser@hotmail.com",
                     "password": "SecurePass123!"
} /*

        - After completing first step click the "+" symbol next to "POST Untitled Request" to create a new API testing for Login
           - Enter in URL http://localhost:5000/api/login in box
                - Go to "Body" select raw and test user login with previously created registration, example provided and click "Send" and a success message should display. Above the success message next to "Body", there should be a created JWT session token in the "cookies" option under the "Value" tab copy this token and save it for the final step to of testing.

                /* {
                      "email": "testuser@hotmail.com",
                     "password": "SecurePass123!"
} /*

        - Lastly after completing the second step click the "+" symbol next to "Post Untitled Request" to create API testing of user authorization and protection of user session by using JWT in cookies and profile creation
            - Enter in URL http://localhost:5000/api/profile in box
                - Go to "Headers" and under the first empty "Key" tab type/lookup "Content-Type" and select it, then in the "Value" tab type/lookup application/json
                - Select another empty box in the "Key" tab type/lookup "Authorization" and select it, then in the "Value" tab paste in the token you got from step 2, into the empty "Value" section. Lastly go to "Body", copy and paste the provided example as for userID open a new terminal, go to the backend directory (cd backend), type command "node listusers.js" and get the id of the user and change the userId in the example code for Postman to the respective correct number.

                /* {
                "userId": 1, *change userID number as needed*
                "hobbies": "Reading, Traveling",
                "personality": "Introvert",
                 "lifestyle": "Active",
                 "socialPreferences": "Small gatherings",
                "beliefs": "Open-minded",
                "goals": "Career growth"
}

If problems occur please review README.md documents and if problems continue talk to Bryan as he worked on the backend portion (so far) of the application

# Trouble shooting
    -check your .env file for correct database credentials
    -ensure MySQL is running, to do this do "Win + R" keys and type services.msc and click any task and press M then look for MySQL or MySQL80 and confirm it says "running"
    -verify if the database and tables exist and are confirgured correctly

# Pushing to GitHub and commands
    - git clone https://github.com/Mectal/ConnectHive.git, to clone repository onto local device
    - go to ConnectHive Directory, cd path/to/your/connecthive
    - do "git status" to check changes you made and what is ready to be committed
    - do "git checkout -b [name of update]", create a few branch for newly added features and or fixes
    - do "git checkout [branch name]", to switch branches
    - do "git branch", to see currently branch you are on
    - do "git add ." - for adding all the changes you made to the repo
    - do "git add filename" to add specific files only
    - do "git commit -m "description of changes made and important details" 
    - do "git fetch origin" to fetch update from local repository
    - do "git rebase origin/master" to apply changes ontop of the latest changes from master
    - do "git push origin [name of update]" to push changes to the repository, pushes branch to the repository under the same name
    - open pull request in GitHub to merge your branch into master, describe changes and request reviews from team (5 people needed to merge into master branch)
    - do "git checkout master", prepare to merge changes into master
    - do "git pull origin master", update local master branch with latest changes from github
    - do "git merge [name of update]
    - do git push origin master, to push updated master branch to github
    ------------------------------------------------------------------------------------------
# clean up and organization of github
    - do "git branch -d [name of update], deletes branch locally
    - do "git push origin --delete [name of update] branch, deletes on remote repository
    - do "git branch -r --merged", list remote branches that merged into master branch and can be deleted
    - do "git stash", temporarily saves changes without committing
    - do "git stash apply", apply stash changes later
    - do "git revert HEAD", undo last commit
    - do "git reset --hard commit_id", to reset branch to previous commit
    - do "git log", to view history of commits

# GitHub practices 
Best Practices for Using Git
Always Branch for New Features:
Start a new branch for every feature or fix to keep master clean and stable.

Commit Frequently:
Regularly commit small changes with clear messages to maintain a clear history.

Rebase Before Merging:
Rebase your feature branch onto master to keep a linear history and avoid complex merges.

Use Pull Requests for Code Reviews:
Leverage PRs to ensure changes are reviewed and approved before merging into master.

Keep master Up-to-Date:
Regularly pull the latest changes from master to avoid conflicts and ensure your branch has the latest updates.

### Summary

- The **Backend `README.md`** includes setup instructions for the backend environment, how to configure and run the server, and details on database setup and API endpoints.
- The **Frontend `README.md`** covers how to start and manage the React application using Create React App, along with the project's directory structure and available scripts.

