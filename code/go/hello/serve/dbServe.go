package serve

import (
	"fmt"
	"io/ioutil"
	"net/http"
)

func DbServe(name string, issueCount int) string {

	urls := fmt.Sprintf("http://www.cwl.gov.cn/cwl_admin/front/cwlkj/search/kjxx/findDrawNotice?name=%s&issueCount=%d",name,issueCount)
	println("issueCount", urls)
	resp, err := http.Get(urls)
	if err != nil {
		fmt.Println("http get error", err)
		return ""
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("read error", err)
		return ""
	}
	fmt.Println("body", string(body))

	return string(body)
}
