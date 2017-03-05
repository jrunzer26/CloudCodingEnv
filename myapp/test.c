// i/o example

#include <iostream>
using namespace std;

int main ()
{
  int i;
  string j;
  cout << "Please enter an integer value: ";
  cin >> i;
  cin >> j;
  cout << "The value you entered is " << i;
  cout << " and its double is " << i*2 << ".\n";
  cout << "My name is: " << j;
  return 0;
}