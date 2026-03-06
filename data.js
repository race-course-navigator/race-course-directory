const REGION_MAP = {
    "kanto": ["東京都", "神奈川県", "埼玉県", "千葉県", "茨城県", "栃木県", "群馬県"],
    "chubu": ["山梨県", "長野県", "新潟県", "富山県", "石川県", "福井県", "静岡県", "愛知県", "岐阜県"],
    "kansai": ["大阪府", "兵庫県", "京都府", "滋賀県", "奈良県", "和歌山県", "三重県"]
};

let courses = [...kanto_courses, ...chubu_courses, ...kansai_courses];
