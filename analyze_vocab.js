const fs = require('fs');

const vocabContent = fs.readFileSync('./vocabulary.js', 'utf8');
const match = vocabContent.match(/const VOCABULARY = (\{[\s\S]*\});/);
const VOCABULARY = JSON.parse(match[1]);

console.log('=== 词汇数据库分析 ===\n');

let totalWords = 0;
let totalWithoutExample = 0;
let totalWithoutGrammar = 0;
let totalWithoutExampleTrans = 0;

const categories = {};

Object.keys(VOCABULARY).forEach(cat => {
    const words = VOCABULARY[cat];
    categories[cat] = {
        total: words.length,
        withoutExample: 0,
        withoutGrammar: 0,
        withoutExampleTrans: 0,
        missingWords: []
    };

    words.forEach(w => {
        totalWords++;
        if (!w.example || w.example.trim() === '') {
            totalWithoutExample++;
            categories[cat].withoutExample++;
            categories[cat].missingWords.push({ tagalog: w.tagalog, chinese: w.chinese, field: 'example' });
        }
        if (!w.exampleTrans || w.exampleTrans.trim() === '') {
            totalWithoutExampleTrans++;
            categories[cat].withoutExampleTrans++;
            if (!categories[cat].missingWords.find(m => m.tagalog === w.tagalog && m.field === 'example')) {
                categories[cat].missingWords.push({ tagalog: w.tagalog, chinese: w.chinese, field: 'exampleTrans' });
            }
        }
        if (!w.grammar || w.grammar.trim() === '') {
            totalWithoutGrammar++;
            categories[cat].withoutGrammar++;
            if (!categories[cat].missingWords.find(m => m.tagalog === w.tagalog && m.field === 'grammar')) {
                categories[cat].missingWords.push({ tagalog: w.tagalog, chinese: w.chinese, field: 'grammar' });
            }
        }
    });
});

console.log('总单词数:', totalWords);
console.log('缺少例句的单词数:', totalWithoutExample);
console.log('缺少例句翻译的单词数:', totalWithoutExampleTrans);
console.log('缺少语法解析的单词数:', totalWithoutGrammar);
console.log('\n=== 分类统计 ===');

Object.keys(categories).forEach(cat => {
    const c = categories[cat];
    console.log(`\n[${cat}] 总数: ${c.total} | 缺例句: ${c.withoutExample} | 缺语法: ${c.withoutGrammar}`);
    if (c.missingWords.length > 0 && c.missingWords.length <= 20) {
        c.missingWords.forEach(w => {
            console.log(`  - ${w.tagalog} (${w.chinese}) [缺少: ${w.field}]`);
        });
    } else if (c.missingWords.length > 20) {
        console.log(`  ... 还有 ${c.missingWords.length - 20} 个缺少内容`);
        c.missingWords.slice(0, 10).forEach(w => {
            console.log(`  - ${w.tagalog} (${w.chinese}) [缺少: ${w.field}]`);
        });
    }
});

fs.writeFileSync('./vocab_analysis.json', JSON.stringify({
    totalWords,
    totalWithoutExample,
    totalWithoutExampleTrans,
    totalWithoutGrammar,
    categories
}, null, 2));

console.log('\n分析结果已保存到 vocab_analysis.json');