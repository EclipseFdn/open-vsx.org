{
  pairList(tab, kfield='name', vfield='value'):: [
    { [kfield]: k, [vfield]: tab[k] }
    for k in std.objectFields(tab)
  ],

  namedObjectList(tab, name_field='name'):: [
    tab[name] + { [name_field]: name }
    for name in std.objectFields(tab)
  ],
}