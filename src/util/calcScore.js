function calcScore(subjectList,state){
    if (subjectList.length > 0) {
        let TestTotle = 0;
        let yearNumb = 0;
        let yearWrongNumb = 0;
        let yearTimes = 0;
        let weekNumb = 0;
        let weekWrongNumb = 0;
        let weekTimes = 0;
        let { typeArr, tabTwoKey, subList } = state
        tabTwoKey--
        let newsubjectList = []
        for (let i = 0; i < subjectList.length; i++) {
            if (subjectList[i].parentId === 0) {
                let itemsubj = subList.find(a => { return a.id === subjectList[i].id })
                if (!itemsubj) {
                    itemsubj = subjectList[i]
                    // subjectList[i].show=false;
                    subjectList[i].actTypeShow = [false, false, false, false];
                    subjectList[i].SecondList = []
                } else {
                    if (itemsubj.actTypeShow === undefined) {
                        itemsubj.actTypeShow = [false, false, false, false];
                    }
                }
                itemsubj.SecondList = []
                itemsubj.u_yearNumb = 0;
                itemsubj.u_yearWrongNumb = 0;
                itemsubj.u_yearTimes = 0;
                itemsubj.u_weekNumb = 0;
                itemsubj.u_weekWrongNumb = 0;
                itemsubj.u_weekTimes = 0;
                newsubjectList.push(itemsubj)
            }
        }
        for (let i = 0; i < subjectList.length; i++) {
            for (let j = 0; j < newsubjectList.length; j++) {
                if (newsubjectList[j].id === subjectList[i].parentId && newsubjectList[j] !== undefined) {
                    newsubjectList[j].SecondList.push(subjectList[i])
                    for (let k = 0; k < newsubjectList[j].SecondList.length; k++) {
                        if (newsubjectList[j].SecondList[k].id === subjectList[i].id) {
                            if (typeArr[tabTwoKey].tcontent === subjectList[i].u_type) {
                                newsubjectList[j].SecondList[k] = subjectList[i]
                            }
                        }
                    }
                }
            }
            if (subjectList[i].parentId !== 0) {
                let parent = newsubjectList.find(a => { return a.id === subjectList[i].parentId })
                let indexParent = newsubjectList.indexOf(parent);
                if (!parent.u_yearNumb)
                    parent.u_yearNumb = 0
                parent.u_yearNumb += subjectList[i].u_yearNumb;
                parent.u_yearWrongNumb += subjectList[i].u_yearWrongNumb;
                parent.u_yearTimes += subjectList[i].u_yearTimes;
                parent.u_weekNumb += subjectList[i].u_weekNumb;
                parent.u_weekWrongNumb += subjectList[i].u_weekWrongNumb;
                parent.u_weekTimes += subjectList[i].u_weekTimes;
                newsubjectList[indexParent] = parent;
            }
            if (typeArr[tabTwoKey].tcontent === subjectList[i].u_type) {
                yearNumb += subjectList[i].u_yearNumb;
                yearWrongNumb += subjectList[i].u_yearWrongNumb;
                yearTimes += subjectList[i].u_yearTimes;
                weekNumb += subjectList[i].u_weekNumb;
                weekWrongNumb += subjectList[i].u_weekWrongNumb;
                weekTimes += subjectList[i].u_weekTimes;
            }
            if (typeArr[tabTwoKey].tcontent === '真题') {
                TestTotle += subjectList[i].trueTestTotle;
            }
            if (typeArr[tabTwoKey].tcontent === "金题") {
                TestTotle += subjectList[i].goldTestTotle;
            }
            if (typeArr[tabTwoKey].tcontent === "押题") {
                TestTotle += subjectList[i].guessTestTotle;
            }
            if (typeArr[tabTwoKey].tcontent === "速记") {
                TestTotle += subjectList[i].speedTestTotle;
            }
        }
        let countInfo = {};//相关数据缓存起来后可用在数据统计界面
        countInfo.TestTotle = TestTotle;
        countInfo.yearNumb = yearNumb;
        countInfo.yearWrongNumb = yearWrongNumb;
        countInfo.yearTimes = yearTimes;
        countInfo.weekNumb = weekNumb;
        countInfo.weekWrongNumb = weekWrongNumb;
        countInfo.weekTimes = weekTimes;
        countInfo.efficient = (yearTimes / (yearNumb === 0 ? 1 : yearNumb)).toFixed(2) //做题效率
        countInfo.accuracy = (((yearNumb - yearWrongNumb) / (yearNumb === 0 ? 1 : yearNumb)) * 100).toFixed(2)//做题正确率
        return countInfo
    }
}
export default calcScore