## littlezhaidi demonlist
個人用途，因為懶得存影片，用這種方式紀錄我通關的demon  
我對js一竅不通所以給AI寫code  

### 檔案結構
```
gddp/
├── assets/                   # 圖片素材
├── data/                     # 靜態資源
│   ├── data-processed.json
│   └── changelogs.json
│
├── js/                       
│   ├── data.js               # 處理資料
│   ├── index.js              # 各頁面邏輯
│   ├── detail.js             
│   ├── about.js              
│   └── changelog.js          
│
├── index.html                # 首頁
├── detail.html               # 關卡詳情
├── stats.html                # 統計
├── changelog.html            # 更新日誌
├── about.html                # 網站詳情
│
├── build.js                  # 打包腳本
├── README.md                 # ur here
└── package.json              # 專案設定檔
```  

### to be added (in case i forgot these ideas)
main list, extended list, legacy list  
`/api/user/{userID}/submissions` or `/api/user/{userID}/submissions/{levelID}`  
improve workflow


