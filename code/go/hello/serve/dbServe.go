package serve

import (
	"fmt"
	"io/ioutil"
	"net/http"
)

func DbServe() string {
	resp, err := http.Get("http://www.cwl.gov.cn")
	if err != nil {
		fmt.Println("http get error", err)
		return ""
	}
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("read error", err)
		return ""
	}
	fmt.Println(string(body))

	return "DbServe"
}
