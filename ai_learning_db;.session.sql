SELECT userId, AVG(accuracy) as avgAccuracy, COUNT(id) as examsCount 
FROM ExamResults 
GROUP BY userId 
ORDER BY avgAccuracy DESC;