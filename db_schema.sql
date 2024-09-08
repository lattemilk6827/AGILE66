PRAGMA foreign_keys = ON;

BEGIN TRANSACTION;

-- Create Users table for storing login credentials
CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);
-- Insert sample data into Users table
INSERT OR IGNORE INTO Users (id, user_name, email, password) VALUES (1, 'John Doe', 'john.doe@example.com', 'password123');

-- Forums Table
CREATE TABLE IF NOT EXISTS Forum (
    forum_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    forum_title VARCHAR(255),
    forum_subtitle VARCHAR(255),
    forum_body TEXT,
    forum_likes INTEGER DEFAULT 0,
    forum_publishedtimestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    forum_category VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- Dummy Data for Forum Table
INSERT INTO Forum (user_id, forum_title, forum_subtitle, forum_body, forum_likes, forum_publishedtimestamp, forum_category) VALUES 
(1, 'Understanding Anxiety', 'Common Symptoms and Causes','Anxiety disorders are the most prevalent mental health issue in the United States, affecting millions of individuals every year. Despite its commonality, anxiety is often misunderstood and stigmatized, leading to many people suffering in silence. It is crucial to shed light on this condition to promote understanding, reduce stigma, and encourage those affected to seek help.<br><br>
    In this post, we will delve into the various symptoms, underlying causes, and available treatments for anxiety, aiming to provide a comprehensive overview of this complex and often debilitating condition.<br><br>
    Anxiety manifests in a multitude of ways, and the symptoms can be highly individualized. However, there are several common symptoms that many people with anxiety experience, which can be broadly categorized into physical and psychological symptoms.<br><br>
    Physical Symptoms:<br>
    The physical manifestations of anxiety can be alarming, sometimes leading individuals to believe they are suffering from a serious medical condition. These symptoms include, but are not limited to:<br>
    - Increased Heart Rate: A rapid heartbeat or palpitations are commonly reported by those with anxiety. This can be accompanied by a sensation of chest tightness or discomfort, leading some to mistakenly fear they are having a heart attack.<br>
    - Excessive Sweating: Sweating excessively, even in non-stressful situations, is another frequent physical symptom of anxiety. This can be particularly noticeable in social situations or when faced with a phobia.<br>
    - Shaking or Trembling: Uncontrollable shaking or trembling, especially in the hands, can be a clear indicator of anxiety. This symptom can be particularly distressing in situations where steady hands are required, such as public speaking.<br>
    - Breathlessness: Many individuals with anxiety experience shortness of breath, a feeling of choking, or hyperventilation. These symptoms can create a vicious cycle, where the fear of not being able to breathe exacerbates the anxiety.<br>
    - Muscle Tension: Persistent muscle tension, particularly in the neck, shoulders, and back, is a common physical symptom of anxiety. This tension can lead to headaches, back pain, and other musculoskeletal issues.<br><br>
    Psychological Symptoms:<br>
    In addition to physical symptoms, anxiety also has profound effects on mental well-being. Common psychological symptoms include:<br>
    - Excessive Worrying: One of the hallmark symptoms of anxiety is excessive worrying. Individuals with anxiety often find themselves stuck in a loop of negative thoughts, constantly anticipating the worst-case scenario.<br>
    - Restlessness: Anxiety often leads to a feeling of restlessness or being on edge. This can make it difficult to relax or focus, leading to irritability and frustration.<br>
    - Fear and Panic: Anxiety can trigger intense fear or panic, even in situations that others might find non-threatening. Panic attacks, characterized by sudden and overwhelming fear, are a severe manifestation of this symptom.<br>
    - Sleep Disturbances: Anxiety frequently disrupts sleep, leading to insomnia or restless sleep. The constant worrying and racing thoughts make it difficult for individuals to fall asleep or stay asleep throughout the night.<br><br>
    Understanding the Causes of Anxiety<br><br>
    The causes of anxiety are complex and multifaceted, often involving a combination of genetic, environmental, and psychological factors. Some of the most common causes include:<br><br>
    - Genetics: Research has shown that anxiety can run in families, suggesting a genetic component. Individuals with a family history of anxiety or other mental health disorders may be more susceptible to developing anxiety themselves.<br>
    - Brain Chemistry: Imbalances in brain chemicals, such as serotonin, dopamine, and norepinephrine, have been linked to anxiety. These chemicals play a crucial role in regulating mood and stress responses.<br>
    - Environmental Stressors: Stressful life events, such as trauma, abuse, or significant life changes, can trigger anxiety. Ongoing stress, whether from work, relationships, or financial issues, can also contribute to the development of anxiety disorders.<br>
    - Personality: Certain personality traits, such as perfectionism, low self-esteem, or a tendency to be overly critical of oneself, can increase the risk of developing anxiety. People who are naturally more sensitive or prone to worry may also be more susceptible.<br><br>
    Treatment Options for Anxiety<br><br>
    Fortunately, anxiety is a treatable condition, and there are several effective treatment options available:<br><br>
    - Therapy: Cognitive-behavioral therapy (CBT) is one of the most widely used and effective treatments for anxiety. CBT helps individuals identify and change negative thought patterns and behaviors that contribute to their anxiety. Other forms of therapy, such as exposure therapy, mindfulness-based therapy, and acceptance and commitment therapy (ACT), can also be beneficial.<br>
    - Medication: In some cases, medication may be prescribed to help manage anxiety. Antidepressants, such as selective serotonin reuptake inhibitors (SSRIs), are commonly used to treat anxiety disorders. Benzodiazepines may also be prescribed for short-term relief of severe anxiety symptoms, although they are typically used with caution due to their potential for dependence.<br>
    - Self-Care Practices: Incorporating self-care practices into daily life can significantly reduce anxiety symptoms. Regular exercise, mindfulness meditation, and proper sleep hygiene are all proven methods for managing anxiety. Additionally, maintaining a healthy diet and avoiding excessive caffeine and alcohol can help stabilize mood and reduce anxiety.<br>
    - Support Networks: Building a strong support network of friends, family, and mental health professionals can make a significant difference in managing anxiety. Support groups, either in-person or online, provide a safe space to share experiences and coping strategies with others who understand what you are going through.<br><br>
    In conclusion, while anxiety can be a challenging and sometimes overwhelming condition, it is important to remember that effective treatment is available. Early intervention and a comprehensive approach to managing anxiety can lead to significant improvements in quality of life. If you or someone you know is struggling with anxiety, do not hesitate to seek help from a qualified mental health professional.', 10, CURRENT_TIMESTAMP, 'General Discussion'),
(1, 'Coping with Stress', 'Effective Strategies', 'Stress is a part of life, but there are effective strategies to cope with it. Learn about different ways to manage and reduce stress. Chronic stress can have significant negative effects on your mental and physical health, leading to issues such as anxiety, depression, and heart disease. Effective stress management techniques include practicing relaxation exercises, maintaining a healthy lifestyle, and seeking support from friends, family, or mental health professionals.', 7, CURRENT_TIMESTAMP, 'General Discussion'),
(1, 'Dealing with Depression', 'How to Recognize and Cope', 'Depression is more than just feeling sad. It is a serious condition that affects your physical and mental health. Explore ways to recognize and cope with depression. Depression can lead to persistent feelings of sadness, loss of interest in activities, and changes in appetite and sleep patterns. Coping with depression often involves a combination of therapy, medication, lifestyle changes, and support from loved ones. It is crucial to seek help early and develop a personalized treatment plan.', 5, CURRENT_TIMESTAMP, 'Depression and Sadness'),
(1, 'My Journey with Depression', 'Personal Story of Overcoming', 'Sharing my personal journey of dealing with depression and the steps I took to overcome it. Throughout my experience with depression, I faced numerous challenges, including feelings of hopelessness and isolation. However, with the support of my family and friends, and by seeking professional help, I was able to develop coping strategies that worked for me. These included therapy, medication, and incorporating positive habits such as regular exercise and healthy eating into my daily routine.', 12, CURRENT_TIMESTAMP, 'Depression and Sadness'),
(1, 'The Importance of Mental Health', 'Why Mental Health Matters', 'Mental health is just as important as physical health. Learn about the importance of mental well-being and how to maintain it. Maintaining good mental health involves managing stress, recognizing and addressing mental health issues early, and adopting healthy lifestyle practices. This can include regular physical activity, balanced nutrition, adequate sleep, and fostering positive relationships. Prioritizing mental health can lead to improved overall well-being and a higher quality of life.', 8, CURRENT_TIMESTAMP, 'Education'),
(1, 'Understanding Emotions', 'Educational Insights', 'Understanding and managing emotions is crucial for mental health. Learn about different emotions and how to deal with them. Emotions are complex and can affect our thoughts, behaviors, and overall mental health. By learning to recognize and understand our emotions, we can develop healthier ways of coping with difficult feelings. This can involve techniques such as mindfulness, emotional regulation strategies, and seeking support from mental health professionals when needed.', 9, CURRENT_TIMESTAMP, 'Education'),
(1, 'Mindfulness Techniques', 'Practices for Stress Relief', 'Mindfulness involves paying full attention to what is going on in the present moment. Discover various mindfulness techniques to help reduce stress. Mindfulness can help reduce stress by encouraging us to focus on the present moment and let go of negative thoughts and worries. Techniques such as deep breathing, meditation, and mindful movement can promote relaxation and improve mental clarity. Practicing mindfulness regularly can lead to long-term benefits for mental health.', 15, CURRENT_TIMESTAMP, 'Mindfulness and Relaxation'),
(1, 'Breathing Exercises', 'Tips for Relaxation', 'Learn different breathing exercises to help you relax and manage stress. Breathing exercises are simple yet powerful tools for reducing stress and promoting relaxation. Techniques such as deep breathing, diaphragmatic breathing, and alternate nostril breathing can help calm the mind and body. Incorporating these exercises into your daily routine can improve your ability to manage stress and enhance overall well-being.', 13, CURRENT_TIMESTAMP, 'Mindfulness and Relaxation'),
(1, 'Therapy and Counseling', 'Finding the Right Support', 'Therapy and counseling can be very beneficial for mental health. Find out how to choose the right type of therapy and what to expect from sessions. There are various types of therapy available, each with its own approach and techniques. It is important to find a therapist who is a good fit for you and who can provide the support you need. Therapy can help you explore your thoughts and feelings, develop coping strategies, and work through mental health challenges.', 12, CURRENT_TIMESTAMP, 'Professional Help'),
(1, 'Types of Therapy', 'Different Approaches Explained', 'Explore the various types of therapy available and find out which one might be right for you. Different therapeutic approaches can address specific mental health issues and personal preferences. Common types of therapy include cognitive-behavioral therapy (CBT), psychodynamic therapy, and humanistic therapy. Understanding these approaches can help you make an informed decision about which type of therapy might be most effective for you.', 6, CURRENT_TIMESTAMP, 'Professional Help'),
(1, 'Mental Health in Children', 'Recognizing Early Signs', 'Children can experience mental health issues just like adults. Learn about the early signs and how to support your child''s mental health. Early signs of mental health issues in children can include changes in behavior, mood swings, and difficulties in school. It is important to address these signs early and provide appropriate support. This can involve talking to your child, seeking professional help, and creating a supportive home environment.', 9, CURRENT_TIMESTAMP, 'Family Issues'),
(1, 'Supporting Your Child', 'Parental Guidance', 'Tips for parents on how to support their children''s mental health and well-being. Parents play a crucial role in supporting their children''s mental health. By fostering open communication, providing a stable and nurturing environment, and seeking professional help when needed, parents can help their children navigate mental health challenges. Encouraging healthy habits and positive behaviors can also contribute to overall well-being.', 10, CURRENT_TIMESTAMP, 'Family Issues'),
(1, 'Exercise and Mental Health', 'The Connection Between Physical and Mental Wellness', 'Regular exercise has numerous benefits for mental health. Understand how physical activity can improve your mood and reduce symptoms of mental health conditions. Physical activity can help reduce symptoms of anxiety and depression, improve mood, and boost overall mental well-being. Incorporating regular exercise into your routine can have lasting positive effects on both your physical and mental health.', 20, CURRENT_TIMESTAMP, 'Healthy Habits'),
(1, 'Healthy Eating', 'Impact on Mental Health', 'Your diet can have a significant impact on your mental health. Learn about the best foods to eat for maintaining a healthy mind. Nutrient-rich foods such as fruits, vegetables, whole grains, and lean proteins can support brain health and improve mood. Avoiding processed foods and sugary snacks can also help maintain stable energy levels and prevent mood swings. A balanced diet is essential for overall mental and physical health.', 14, CURRENT_TIMESTAMP, 'Healthy Habits'),
(1, 'Sleep and Mental Health', 'The Importance of a Good Night''s Sleep', 'Sleep is crucial for mental health. Explore the relationship between sleep and mental wellness, and get tips for improving your sleep hygiene. Adequate sleep is essential for mental health, as it helps regulate mood, improve cognitive function, and reduce stress. Establishing a consistent sleep routine, creating a restful sleep environment, and avoiding stimulants before bedtime can improve sleep quality and overall well-being.', 3, CURRENT_TIMESTAMP, 'School and Homework Stress'),
(1, 'Importance of Routine', 'Establishing Healthy Sleep Habits', 'Creating a consistent sleep routine is key to improving sleep quality and mental health. A regular sleep schedule can help regulate your body''s internal clock, making it easier to fall asleep and wake up feeling refreshed. Incorporating relaxation techniques, such as reading or taking a warm bath before bed, can also promote better sleep habits and enhance mental health.', 5, CURRENT_TIMESTAMP, 'School and Homework Stress'),
(1, 'Friendship Building', 'Making New Friends', 'Making new friends can be challenging, but it''s important for mental health. Learn tips and strategies for building and maintaining friendships. Building strong friendships can provide emotional support, increase happiness, and reduce stress. Effective strategies for making friends include being approachable, showing interest in others, and participating in social activities.', 8, CURRENT_TIMESTAMP, 'Friendship and Relationships'),
(1, 'Maintaining Healthy Relationships', 'Conflict Resolution', 'Healthy relationships are key to mental well-being. Discover techniques for resolving conflicts and maintaining positive relationships. Conflicts are a natural part of relationships, but they can be managed effectively through communication, empathy, and compromise. Learning to resolve conflicts in a healthy way can strengthen relationships and improve mental health.', 6, CURRENT_TIMESTAMP, 'Friendship and Relationships'),
(1, 'Dealing with Bullying', 'Strategies for Children', 'Bullying can have a significant impact on mental health. Learn strategies for dealing with bullying and finding support. Children who experience bullying may feel isolated, anxious, and depressed. It is important to seek help from trusted adults, such as parents, teachers, or school counselors. Additionally, building self-confidence and developing assertiveness skills can help children stand up to bullies and protect their mental health.', 7, CURRENT_TIMESTAMP, 'Bullying and Peer Pressure'),
(1, 'Standing Up to Peer Pressure', 'Tips for Kids', 'Peer pressure can be challenging, but it is possible to resist and make independent choices. Learn tips for standing up to peer pressure and maintaining your values. Building self-confidence, setting boundaries, and finding supportive friends can help children resist negative peer pressure. Encouraging open communication with trusted adults can also provide guidance and support.', 10, CURRENT_TIMESTAMP, 'Bullying and Peer Pressure'),
(1, 'Creative Expression through Art', 'Art as Therapy', 'Expressing emotions through art can be therapeutic. Learn how drawing, painting, and other creative activities can help manage stress and improve mental health. Art therapy allows children to explore their feelings in a non-verbal way, providing an outlet for self-expression and emotional release. Engaging in creative activities can also boost self-esteem and provide a sense of accomplishment.', 8, CURRENT_TIMESTAMP, 'Creative Expression'),
(1, 'Writing for Wellness', 'Journaling and Mental Health', 'Writing about your thoughts and feelings can be a powerful tool for mental health. Discover the benefits of journaling and other forms of creative writing. Journaling helps children process their emotions, reflect on their experiences, and develop problem-solving skills. Regular writing can also enhance self-awareness and provide a safe space for expressing difficult feelings.', 9, CURRENT_TIMESTAMP, 'Creative Expression'),
(1, 'Ask a Therapist', 'Professional Advice for Kids', 'Have questions about mental health? Ask a licensed therapist for advice and get professional guidance in a safe, moderated environment. This category provides a platform for children to seek expert advice on various mental health topics, ensuring they receive accurate and reliable information.', 12, CURRENT_TIMESTAMP, 'Ask a Professional'),
(1, 'Mental Health Q&A', 'Your Questions Answered', 'Submit your questions about mental health and get answers from professionals. Learn more about managing emotions, coping strategies, and mental health resources. This interactive category helps children understand mental health better by providing expert responses to their concerns and queries.', 11, CURRENT_TIMESTAMP, 'Ask a Professional'),
(1, 'Sharing Success Stories', 'Inspiring Mental Health Journeys', 'Read and share success stories about overcoming mental health challenges. Inspire others with your journey and find motivation from peers. Success stories highlight personal achievements in managing mental health, offering hope and encouragement to others facing similar struggles.', 15, CURRENT_TIMESTAMP, 'Success Stories and Positivity'),
(1, 'Celebrating Positivity', 'Moments of Joy', 'Share positive experiences and moments of joy that uplift your spirits. This category focuses on celebrating small victories and finding happiness in everyday life. Positive interactions and shared joy can strengthen community bonds and enhance overall well-being.', 13, CURRENT_TIMESTAMP, 'Success Stories and Positivity'),
(1, 'Effective Coping Strategies', 'Managing Mental Health', 'Share and discover effective coping strategies for various mental health challenges. Learn from peers and provide mutual support in managing stress, anxiety, and other issues. This category encourages the exchange of practical tips and techniques to improve mental health and build resilience.', 14, CURRENT_TIMESTAMP, 'Coping Strategies'),
(1, 'Building Resilience', 'Overcoming Challenges', 'Explore ways to build resilience and overcome life''s challenges. Learn how to bounce back from setbacks and develop a strong mental foundation. Building resilience involves developing a positive mindset, practicing self-care, and seeking support when needed. Resilient individuals can adapt to adversity and maintain their mental well-being.', 16, CURRENT_TIMESTAMP, 'Coping Strategies'),
(1, 'Mental Health Resources', 'Helpful Tools and Information', 'Access a repository of mental health resources, including articles, videos, and tools to support well-being. Find reliable information and practical tools to enhance your mental health journey. This category provides easy access to educational materials and self-help resources.', 8, CURRENT_TIMESTAMP, 'Mental Health Resources'),
(1, 'Educational Videos', 'Learning about Mental Health', 'Watch educational videos about mental health topics. Gain insights from experts and learn new strategies for managing mental health. Videos can be a valuable resource for visual learners, offering engaging and informative content to support mental health education.', 10, CURRENT_TIMESTAMP, 'Mental Health Resources'),
(1, 'Gaming and Mental Health', 'Finding Balance', 'Discuss how gaming can impact mental health and find a healthy balance between gaming and other activities. Learn how to enjoy gaming while maintaining mental well-being. Moderation and mindful gaming practices can help prevent negative effects such as addiction and social isolation.', 9, CURRENT_TIMESTAMP, 'Gaming and Hobbies'),
(1, 'Hobbies for Relaxation', 'Exploring New Interests', 'Explore different hobbies that promote relaxation and mental health. Share your favorite activities and discover new ones to try. Hobbies can provide a sense of purpose, enhance creativity, and offer a break from stress.', 7, CURRENT_TIMESTAMP, 'Gaming and Hobbies');

-- Forums Comments Table
CREATE TABLE IF NOT EXISTS Forum_Comments (
    comment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    forum_id INTEGER,
    commenter_name TEXT NOT NULL,
    comment_text TEXT,
    comment_likes INTEGER DEFAULT 0,
    comment_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (forum_id) REFERENCES Forum(forum_id)
);

-- Dummy Data for Forum_Comments Table
INSERT INTO Forum_Comments (forum_id, commenter_name, comment_text, comment_likes, comment_timestamp) VALUES 
(1, 'John Doe', 'Great article on understanding anxiety. Very informative!', 3, CURRENT_TIMESTAMP),
(1, 'Jane Doe', 'I found the symptoms list particularly helpful.', 2, CURRENT_TIMESTAMP),
(2, 'Alice', 'The strategies mentioned here have really helped me manage stress better.', 5, CURRENT_TIMESTAMP),
(3, 'Bob', 'Depression is tough, but knowing these coping methods makes it manageable.', 1, CURRENT_TIMESTAMP),
(4, 'Charlie', 'Thanks for sharing your personal story. It’s very inspiring!', 4, CURRENT_TIMESTAMP),
(4, 'Eve', 'I appreciate the honesty in your journey. It gives hope to others.', 6, CURRENT_TIMESTAMP),
(5, 'Frank', 'Mental health is indeed important. Thanks for highlighting this.', 7, CURRENT_TIMESTAMP),
(6, 'Grace', 'Understanding emotions is key to better mental health. Good read!', 5, CURRENT_TIMESTAMP),
(7, 'Heidi', 'Mindfulness has been a game changer for my stress levels. Highly recommend it.', 3, CURRENT_TIMESTAMP),
(8, 'Ivan', 'Breathing exercises are so effective. This article is a must-read.', 9, CURRENT_TIMESTAMP),
(9, 'Judy', 'Finding the right therapist can be daunting but this guide makes it easier.', 2, CURRENT_TIMESTAMP),
(10, 'Mallory', 'Good overview of the different types of therapy available.', 4, CURRENT_TIMESTAMP),
(11, 'Niaj', 'Early signs in children are crucial to recognize. Great article.', 5, CURRENT_TIMESTAMP),
(12, 'Olivia', 'Supportive tips for parents. Very useful!', 6, CURRENT_TIMESTAMP),
(13, 'Peggy', 'Exercise has improved my mental health significantly.', 1, CURRENT_TIMESTAMP),
(14, 'Quinn', 'Healthy eating can indeed impact your mental state. Good tips.', 3, CURRENT_TIMESTAMP),
(15, 'Rick', 'Sleep is often overlooked. Thanks for the insights.', 4, CURRENT_TIMESTAMP),
(16, 'Steve', 'A consistent sleep routine has helped me immensely.', 2, CURRENT_TIMESTAMP),
(17, 'Tina', 'Making new friends is tough, but these tips are helpful.', 6, CURRENT_TIMESTAMP),
(18, 'Uma', 'Conflict resolution skills are crucial for healthy relationships.', 5, CURRENT_TIMESTAMP),
(19, 'Vince', 'Bullying can be devastating. These strategies are very helpful.', 4, CURRENT_TIMESTAMP),
(20, 'Wendy', 'Standing up to peer pressure is important. Good advice here.', 7, CURRENT_TIMESTAMP),
(21, 'Xander', 'Art as therapy is a wonderful concept. Very therapeutic.', 5, CURRENT_TIMESTAMP),
(22, 'Yara', 'Journaling has helped me process my emotions. Highly recommend.', 3, CURRENT_TIMESTAMP),
(23, 'Zara', 'Great to have a place to ask professionals. Very helpful.', 2, CURRENT_TIMESTAMP),
(24, 'Alex', 'This Q&A section is very informative. Thanks for the answers.', 4, CURRENT_TIMESTAMP),
(25, 'Blake', 'Reading success stories is very motivating. Thanks for sharing.', 5, CURRENT_TIMESTAMP),
(26, 'Cathy', 'Positivity can be infectious. Great platform to share joy.', 3, CURRENT_TIMESTAMP),
(27, 'Dan', 'Coping strategies shared here are practical and useful.', 6, CURRENT_TIMESTAMP),
(28, 'Elle', 'Building resilience is crucial. Thanks for these tips.', 4, CURRENT_TIMESTAMP),
(29, 'Fred', 'Access to these mental health resources is invaluable.', 2, CURRENT_TIMESTAMP),
(30, 'George', 'Educational videos are a great resource. Very enlightening.', 3, CURRENT_TIMESTAMP),
(31, 'Hannah', 'Balancing gaming and mental health is important. Good insights.', 5, CURRENT_TIMESTAMP),
(32, 'Ivy', 'Hobbies can definitely help with relaxation. Great suggestions.', 4, CURRENT_TIMESTAMP);


CREATE TABLE IF NOT EXISTS Forum_Discussions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    posted_on DATETIME DEFAULT CURRENT_TIMESTAMP,
    likes INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- Dummy data for Forum_Discussions table
INSERT INTO Forum_Discussions (user_id, title, content, posted_on, likes) VALUES 
(1, 'First discussion', 'First discussion content', CURRENT_TIMESTAMP, 15),
(1, 'Second discussion', 'Second discussion content', CURRENT_TIMESTAMP, 20),
(1, 'Third discussion', 'Third discussion content', CURRENT_TIMESTAMP, 10);


-- Likes
CREATE TABLE IF NOT EXISTS Likes (
    user_id INTEGER,
    forum_id INTEGER,
    PRIMARY KEY (user_id, forum_id),
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (forum_id) REFERENCES Forum(forum_id)
);

-- Create assessments table if it does not exist
CREATE TABLE IF NOT EXISTS assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    q1 INTEGER,
    q2 INTEGER,
    q3 INTEGER,
    q4 INTEGER,
    q5 INTEGER,
    score INTEGER,
    level TEXT,
    description TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(userId) REFERENCES Users(id)
);

-- Goals Table
CREATE TABLE IF NOT EXISTS goals (
    user_id INTEGER PRIMARY KEY,
    goals_text TEXT,
    FOREIGN KEY(user_id) REFERENCES Users(id)
);

-- Create Games table
CREATE TABLE IF NOT EXISTS Games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    image TEXT,
    description TEXT,
    category TEXT,
    section TEXT,
    progress INTEGER DEFAULT 0,
    user_id INTEGER,
    FOREIGN KEY(user_id) REFERENCES Users(id)
);

-- Insert sample data into Games table
INSERT OR REPLACE INTO Games (id, title, description, category, section, progress, user_id) VALUES 
(1, 'Mind Quest', 'Test your memory to sharpen your awareness', 'easy', 'mind', 0, 1),
(2, 'Brain Galore', 'Unravel the mysteries by solving puzzles', 'easy', 'mind', 0, 1),
(3, 'Mystery Solver', 'Challenge your Math brain', 'medium', 'mind', 0, 1),
(4, 'Logic Master', 'Test your logical thinking with advanced puzzles', 'medium', 'mind', 0, 1),
(5, 'Memory Mastery ', 'Master the art of memory', 'difficult', 'mind', 0, 1),
(6, 'Reaction Marathon', 'Test your reflexes with unpredictable pace', 'difficult', 'mind', 0, 1),
(7, 'Breath Exercise', 'Practice techniques to calm your mind and reduce tension', 'easy', 'relaxation', 0, 1),
(8, 'Yoga Pose', 'Enjoy coloring intricate designs to calm your mind.', 'easy', 'relaxation', 0, 1),
(9, 'Colouring', 'Play guess the drawing or rent out feelings by colouring', 'medium', 'relaxation', 0, 1),
(10, 'Meditate Away', 'Relax with calming a aura that takes you to another dimension', 'medium', 'relaxation', 0, 1),
(11, 'Nature Sounds', 'Experience deep relaxation techniques and exercises', 'difficult', 'relaxation', 0, 1),
(12, 'Cloud Punch', 'Master advanced relaxation with your remaining brain cells', 'difficult', 'relaxation', 0, 1),
(13, 'Calm The Brain', 'Learn how to control your brain', 'easy', 'educational', 0, 1),
(14, 'Peace of Mind', 'Explore basic mind concepts through activities', 'easy', 'educational', 0, 1),
(15, 'History Stress', 'Discover historical events and cope in a fun way', 'medium', 'educational', 0, 1),
(16, 'Emotions Quest', 'Learn about different feelings and their outcome', 'medium', 'educational', 0, 1),
(17, 'Tough Times', 'Take on challenging scenarios and how to overcome them ', 'difficult', 'educational', 0, 1),
(18, 'Brain Challenges', 'Take on challenging math problems and puzzles', 'difficult', 'educational', 0, 1);

-- Save time progress for games to show in progress bars
CREATE TABLE IF NOT EXISTS game_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    elapsed_minutes INTEGER DEFAULT 0,
    UNIQUE(game_id, user_id)
);


COMMIT;
