package main

import ("fmt")

func main() {
	base()
}

func base() {
	var countryCapitalMap map[string]string
	countryCapitalMap = make(map[string]string)

	/* map插入key - value对,各个国家对应的首都 */
	countryCapitalMap [ "France" ] = "巴黎"
	countryCapitalMap [ "Italy" ] = "罗马"
	countryCapitalMap [ "Japan" ] = "东京"
	countryCapitalMap [ "India " ] = "新德里"

	for country, capital := range countryCapitalMap {
		fmt.Println(country, "首都是", countryCapitalMap[country], "con: ", capital)
	}

	/*查看元素在集合中是否存在 */
	capital, ok := countryCapitalMap["American"]
	fmt.Println("capital", capital, '[', countryCapitalMap["American"])
	fmt.Println("ok", ok)

	if (ok) {
		fmt.Println("American", capital)
	} else {
		fmt.Println("American is not found!")
	}

/**
	France 首都是 巴黎 con:  巴黎
	Italy 首都是 罗马 con:  罗马     
	Japan 首都是 东京 con:  东京     
	India  首都是 新德里 con:  新德里
	capital  91
	ok false
	American is not found!
*/

	/*删除元素*/
	delete(countryCapitalMap, "France")
}