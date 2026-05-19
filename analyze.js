const fs = require('fs');

// 读取现有词汇数据库
const vocabContent = fs.readFileSync('./vocabulary.js', 'utf8');
const match = vocabContent.match(/const VOCABULARY = (\{[\s\S]*\});/);
const VOCABULARY = JSON.parse(match[1]);

const existing = new Set();
Object.keys(VOCABULARY).forEach(cat => {
    VOCABULARY[cat].forEach(w => existing.add(w.tagalog.toLowerCase()));
});

console.log('现有单词数:', existing.size);
console.log('现有分类:', Object.keys(VOCABULARY));

// 从文档中提取单词
const docs = ['形容词.txt', '基础词.txt', '动词.txt', '专题训练.txt'];
const newWords = [];

docs.forEach(doc => {
    try {
        const content = fs.readFileSync('./莹的/' + doc, 'utf8');
        // 提取单词数据
        const wordMatches = content.match(/\{t:"([^"]+)"[^}]+\}/g) || [];
        wordMatches.forEach(match => {
            const tMatch = match.match(/t:"([^"]+)"/);
            const cMatch = match.match(/(?:c:"([^"]+)"|z:"([^"]+)")/);
            const stMatch = match.match(/(?:st:"([^"]+)"|et:"([^"]+)")/);
            const scMatch = match.match(/(?:sc:"([^"]+)"|szh:"([^"]+)")/);
            
            if (tMatch) {
                const tagalog = tMatch[1];
                if (!existing.has(tagalog.toLowerCase())) {
                    newWords.push({
                        tagalog: tagalog,
                        chinese: cMatch ? (cMatch[1] || cMatch[2]) : '',
                        example: stMatch ? (stMatch[1] || stMatch[2]) : '',
                        exampleTrans: scMatch ? (scMatch[1] || scMatch[2]) : '',
                        source: doc
                    });
                }
            }
        });
    } catch (e) {
        console.log('读取', doc, '失败:', e.message);
    }
});

console.log('\n新单词数量:', newWords.length);
if (newWords.length > 0) {
    console.log('新单词列表:');
    newWords.forEach(w => {
        console.log(`  ${w.tagalog} - ${w.chinese}`);
    });
}

// 保存新单词
fs.writeFileSync('./new_words.json', JSON.stringify(newWords, null, 2));
console.log('\n新单词已保存到 new_words.json');