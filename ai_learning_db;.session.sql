SELECT userId, AVG(accuracy) as avgAccuracy, COUNT(id) as examsCount 
FROM ExamResults 
GROUP BY userId 
ORDER BY avgAccuracy DESC;


UPDATE "Users" SET role = 'admin' WHERE email = 'chidex6250@gmail.com';