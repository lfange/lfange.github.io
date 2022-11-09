package serve

import (
	"fmt"
	"github.com/jackdanger/collectlinks"
	//"io/ioutil"
	"net/http"
)

func CrawServe() []string {

	urls := "http://www.baidu.com/"

	client := &http.Client{}
	req, _ := http.NewRequest("GET", urls, nil)
	// 自定义Header
	req.Header.Set("User-Agent", "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)")

	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("http get error", err)
	}
	//函数结束后关闭相关链接
	defer resp.Body.Close()

	links := collectlinks.All(resp.Body)
	for _, link := range links {
		fmt.Println("parse url", link)
	}

	return links
}
