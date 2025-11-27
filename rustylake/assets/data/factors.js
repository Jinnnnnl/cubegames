// CNE6因子数据
const FACTORS_DATA = {
    momentum: {
        name: "动量因子",
        treasure: "打神鞭",
        definition: "反映股票价格趋势延续性的因子",
        features: [
            "近期表现好的股票倾向于继续表现良好",
            "跟随市场趋势，避免逆势操作",
            "适用于趋势跟踪策略"
        ],
        insight: "帮助识别和利用市场趋势",
        color: "#FF6B6B",
        icon: "⚡",
        description: "动量因子基于股票价格的历史表现来预测未来走势，是量化投资中最经典的因子之一。"
    },
    
    value: {
        name: "估值因子", 
        treasure: "太极图",
        definition: "衡量股票相对价值高低的因子",
        features: [
            "识别被低估的优质股票",
            "基于财务指标判断价值",
            "适合价值投资策略"
        ],
        insight: "发现市场定价错误的投资机会",
        color: "#4ECDC4",
        icon: "✨",
        description: "估值因子通过分析公司的基本面数据，寻找被市场低估的投资标的。"
    },
    
    size: {
        name: "规模因子",
        treasure: "混元珠", 
        definition: "反映公司市值规模对收益影响的因子",
        features: [
            "小市值公司通常有更高成长潜力",
            "大市值公司相对稳定",
            "规模效应在不同市场环境下表现不同"
        ],
        insight: "平衡成长性与稳定性的投资选择",
        color: "#45B7D1",
        icon: "👻",
        description: "规模因子揭示了不同市值公司的风险收益特征，是资产配置的重要考量。"
    },
    
    liquidity: {
        name: "流动性因子",
        treasure: "定海珠",
        definition: "衡量股票交易活跃度和变现能力的因子", 
        features: [
            "高流动性降低交易成本",
            "流动性溢价影响股票定价",
            "市场压力下流动性风险凸显"
        ],
        insight: "管理交易成本和流动性风险",
        color: "#96CEB4",
        icon: "❄️",
        description: "流动性因子关注股票的可交易性，对大资金的投资策略尤为重要。"
    },
    
    growth: {
        name: "成长因子",
        treasure: "九龙神火罩",
        definition: "反映公司业务增长潜力的因子",
        features: [
            "关注收入和利润增长率",
            "识别高成长性公司",
            "成长性与估值需要平衡"
        ],
        insight: "捕捉企业发展的投资机遇",
        color: "#FFEAA7",
        icon: "🔥", 
        description: "成长因子专注于发现具有强劲增长动力的公司，适合成长型投资策略。"
    },
    
    dividend: {
        name: "分红因子",
        treasure: "阴阳镜",
        definition: "基于股息分红水平的投资因子",
        features: [
            "稳定的现金流回报",
            "反映公司盈利质量",
            "适合收益型投资者"
        ],
        insight: "获得稳定的投资收益",
        color: "#DDA0DD",
        icon: "🌊",
        description: "分红因子关注能够持续分红的优质公司，提供稳定的现金流收益。"
    },
    
    quality: {
        name: "质量因子", 
        treasure: "番天印",
        definition: "衡量公司经营质量和财务健康度的因子",
        features: [
            "关注盈利能力和财务稳健性",
            "识别优质经营的公司",
            "降低投资风险"
        ],
        insight: "选择基本面扎实的投资标的",
        color: "#FF7675",
        icon: "💥",
        description: "质量因子通过多维度财务指标评估公司质量，是防御性投资的重要工具。"
    },
    
    sentiment: {
        name: "情绪因子",
        treasure: "落魂钟", 
        definition: "反映市场情绪和投资者行为的因子",
        features: [
            "捕捉市场情绪波动",
            "利用投资者非理性行为",
            "短期效应明显"
        ],
        insight: "理解市场心理，逆向投资",
        color: "#A29BFE",
        icon: "🩸",
        description: "情绪因子利用市场的非理性情绪，通过逆向思维获得超额收益。"
    },
    
    volatility: {
        name: "波动率因子",
        treasure: "化血神刀",
        definition: "基于股票价格波动特征的因子", 
        features: [
            "低波动股票长期表现更好",
            "波动率与收益的非线性关系",
            "风险调整后收益的重要指标"
        ],
        insight: "在控制风险的前提下获得收益",
        color: "#FDCB6E",
        icon: "🏜️",
        description: "波动率因子揭示了风险与收益的复杂关系，是风险管理的核心工具。"
    }
};

// 导出数据（如果在模块环境中）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FACTORS_DATA;
}